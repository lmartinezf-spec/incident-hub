<#
.SYNOPSIS
  Despliega el paquete del pipeline en un ambiente y ejecuta el smoke test.

.DESCRIPTION
  Lo invocan los jobs deploy-staging y deploy-produccion de .gitlab-ci.yml.
  1. Toma release/incident-hub-<versión>.zip (artefacto del job empaquetar).
  2. Lo extrae en una carpeta temporal.
  3. Ejecuta deploy.ps1 y smoke-test.ps1 que vienen DENTRO del paquete,
     así cada versión se despliega con sus propios scripts.

  Los secretos (DB_PASSWORD, JWT_SECRET, SEED_*) llegan como variables de
  entorno desde GitLab (Settings > CI/CD > Variables, con ámbito por ambiente).
#>
param(
  [Parameter(Mandatory = $true)][ValidateSet('staging', 'production')][string]$Ambiente,
  [Parameter(Mandatory = $true)][int]$Puerto,
  [string]$RaizDespliegue = $(if ($env:INCIDENT_HUB_RAIZ) { $env:INCIDENT_HUB_RAIZ } else { 'C:\incident-hub' })
)

$ErrorActionPreference = 'Stop'

function Ruta([string[]]$Partes) {
  return [System.IO.Path]::Combine($Partes)
}

$raiz = (Resolve-Path (Ruta @($PSScriptRoot, '..', '..'))).Path
$zip = Get-ChildItem -Path (Ruta @($raiz, 'release')) -Filter 'incident-hub-*.zip' -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1
if (-not $zip) {
  throw 'No se encontró release/incident-hub-*.zip: este job necesita el artefacto del job empaquetar.'
}

$sufijo = if ($env:CI_JOB_ID) { $env:CI_JOB_ID } else { Get-Date -Format 'yyyyMMddHHmmss' }
$destino = Ruta @([System.IO.Path]::GetTempPath(), "incident-hub-$Ambiente-$sufijo")
if (Test-Path $destino) { Remove-Item -Path $destino -Recurse -Force }
Expand-Archive -Path $zip.FullName -DestinationPath $destino

Write-Host "Paquete: $($zip.Name) -> $Ambiente (puerto $Puerto)"
$scripts = Ruta @($destino, 'devops', 'scripts')

& (Ruta @($scripts, 'deploy.ps1')) -Ambiente $Ambiente -Paquete $destino -Puerto $Puerto -RaizDespliegue $RaizDespliegue

& (Ruta @($scripts, 'smoke-test.ps1')) -Puerto $Puerto -ArchivoVersion (Ruta @($destino, 'version.json'))
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Remove-Item -Path $destino -Recurse -Force -ErrorAction SilentlyContinue
