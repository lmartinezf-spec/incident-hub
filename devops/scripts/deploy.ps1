<#
.SYNOPSIS
  Despliega un paquete de IT Incident Hub en el equipo del runner autohospedado.

.DESCRIPTION
  Estructura por ambiente (por defecto en C:\incident-hub):
    <raiz>/<ambiente>/current   versión activa
    <raiz>/<ambiente>/previous  versión anterior (para rollback)
    <raiz>/<ambiente>/next      versión en preparación
    <raiz>/scripts              copia de rollback.ps1 y smoke-test.ps1
    <raiz>/.pm2                 PM2_HOME compartido por todos los ambientes

  Pasos: validar herramientas y secretos -> preparar "next" -> generar .env ->
  npm ci --omit=dev -> migraciones -> seed opcional -> detener PM2 -> rotar carpetas -> iniciar PM2.

  Lo invoca desplegar-ci.ps1 desde el runner autohospedado de GitLab. Los valores
  llegan como variables de entorno definidas en GitLab (Settings > CI/CD > Variables).

  Compatible con Windows PowerShell 5.1 y PowerShell 7 (Windows, Linux y macOS).
#>
param(
  [Parameter(Mandatory = $true)][ValidateSet('staging', 'production')][string]$Ambiente,
  [Parameter(Mandatory = $true)][string]$Paquete,
  [Parameter(Mandatory = $true)][int]$Puerto,
  [string]$RaizDespliegue = 'C:\incident-hub'
)

$ErrorActionPreference = 'Stop'

function Ruta([string[]]$Partes) {
  return [System.IO.Path]::Combine($Partes)
}

function Leer-Variable([string]$Nombre) {
  $valor = [Environment]::GetEnvironmentVariable($Nombre)
  if ([string]::IsNullOrWhiteSpace($valor)) { return $null }
  return $valor
}

function Invocar([string]$Comando, [string[]]$Argumentos, [switch]$PermitirFallo) {
  # npm y pm2 escriben avisos en stderr; con 'Stop' PowerShell 5.1 los trataría como errores.
  $previo = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & $Comando @Argumentos
  $codigo = $LASTEXITCODE
  $ErrorActionPreference = $previo
  if ($codigo -ne 0 -and -not $PermitirFallo) {
    throw "'$Comando $($Argumentos -join ' ')' terminó con código $codigo"
  }
}

function Escribir-Utf8SinBom([string]$Archivo, [string[]]$Lineas) {
  $codificacion = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllLines($Archivo, $Lineas, $codificacion)
}

$destino = Ruta @($RaizDespliegue, $Ambiente)
$actual = Ruta @($destino, 'current')
$anterior = Ruta @($destino, 'previous')
$siguiente = Ruta @($destino, 'next')
$marcador = Ruta @($destino, 'activado-por-ultimo-despliegue')
$proceso = "incident-hub-$Ambiente"
$version = (Get-Content (Ruta @($Paquete, 'version.json')) -Raw | ConvertFrom-Json).version

# PM2 compartido por todos los ambientes. El daemon debe estar iniciado fuera del
# runner (pm2 ping con el mismo PM2_HOME, ver docs/runner-autohospedado.md) para que
# las aplicaciones sigan vivas cuando termina el job.
$env:PM2_HOME = Ruta @($RaizDespliegue, '.pm2')

Write-Host "== Desplegando IT Incident Hub v$version en $Ambiente (puerto $Puerto) =="

# 1. Herramientas y secretos
foreach ($herramienta in @('node', 'npm', 'pm2')) {
  if (-not (Get-Command $herramienta -ErrorAction SilentlyContinue)) {
    throw "No se encontró '$herramienta' en el equipo del runner. Ver docs/runner-autohospedado.md"
  }
}
foreach ($secreto in @('DB_PASSWORD', 'JWT_SECRET')) {
  if (-not (Leer-Variable $secreto)) {
    throw "Falta la variable $secreto para el ambiente $Ambiente (GitLab > Settings > CI/CD > Variables)"
  }
}

# 2. Copiar scripts de operación a una ruta fija (los usa el rollback automático)
$carpetaScripts = Ruta @($RaizDespliegue, 'scripts')
New-Item -ItemType Directory -Path $carpetaScripts -Force | Out-Null
Copy-Item -Path (Ruta @($Paquete, 'devops', 'scripts', '*.ps1')) -Destination $carpetaScripts -Force

# 3. Preparar la nueva versión
New-Item -ItemType Directory -Path $destino -Force | Out-Null
Remove-Item $marcador -Force -ErrorAction SilentlyContinue
if (Test-Path $siguiente) { Remove-Item $siguiente -Recurse -Force }
New-Item -ItemType Directory -Path $siguiente | Out-Null
Copy-Item -Path (Ruta @($Paquete, '*')) -Destination $siguiente -Recurse -Force

# 4. .env del ambiente: se genera desde variables del pipeline, nunca viene del repositorio
$dbHost = Leer-Variable 'DB_HOST'; if (-not $dbHost) { $dbHost = 'localhost' }
$dbPort = Leer-Variable 'DB_PORT'; if (-not $dbPort) { $dbPort = '5432' }
$dbName = Leer-Variable 'DB_NAME'; if (-not $dbName) { $dbName = "incident_hub_$Ambiente" }
$dbUser = Leer-Variable 'DB_USER'; if (-not $dbUser) { $dbUser = 'postgres' }
$cors = Leer-Variable 'CORS_ORIGIN'; if (-not $cors) { $cors = "http://localhost:$Puerto" }

$lineasEnv = @(
  'NODE_ENV=production',
  "PORT=$Puerto",
  "DB_HOST=$dbHost",
  "DB_PORT=$dbPort",
  "DB_NAME=$dbName",
  "DB_USER=$dbUser",
  "DB_PASSWORD=$(Leer-Variable 'DB_PASSWORD')",
  "JWT_SECRET=$(Leer-Variable 'JWT_SECRET')",
  'JWT_EXPIRES_IN=8h',
  "CORS_ORIGIN=$cors"
)
Escribir-Utf8SinBom -Archivo (Ruta @($siguiente, 'backend', '.env')) -Lineas $lineasEnv

# 5. Dependencias de producción, migraciones y datos iniciales
Push-Location (Ruta @($siguiente, 'backend'))
try {
  Write-Host '-- npm ci --omit=dev'
  Invocar 'npm' @('ci', '--omit=dev', '--no-audit', '--no-fund')

  Write-Host '-- migraciones'
  Invocar 'node' @('scripts/migrate.js')

  if (Leer-Variable 'SEED_ADMIN_PASSWORD') {
    $argumentosSeed = @('scripts/seed.js')
    if ((Leer-Variable 'SEED_DEMO') -eq 'true' -and (Leer-Variable 'SEED_DEMO_PASSWORD')) { $argumentosSeed += '--demo' }
    Write-Host "-- datos iniciales ($($argumentosSeed -join ' '))"
    Invocar 'node' $argumentosSeed
  }
}
finally {
  Pop-Location
}

# 6. Activar: detener proceso, rotar carpetas, iniciar
Write-Host '-- activando nueva versión'
Invocar 'pm2' @('delete', $proceso) -PermitirFallo
if (Test-Path $anterior) { Remove-Item $anterior -Recurse -Force }
if (Test-Path $actual) { Move-Item $actual $anterior }
Move-Item $siguiente $actual
Set-Content -Path $marcador -Value $version -Encoding ascii

$carpetaBackend = Ruta @($actual, 'backend')
Invocar 'pm2' @('start', (Ruta @($carpetaBackend, 'server.js')), '--name', $proceso, '--cwd', $carpetaBackend, '--time')
Invocar 'pm2' @('save')

Write-Host "== v$version activa en $Ambiente`: http://localhost:$Puerto =="
