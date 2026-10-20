<#
.SYNOPSIS
  Arma el paquete desplegable incident-hub-<versión>.zip.

.DESCRIPTION
  Contenido del paquete:
    backend/          código del API (sin node_modules, coverage, reports ni .env)
    backend/public/   frontend compilado (frontend/dist, artefacto del job frontend)
    database/migrations/*.sql
    devops/scripts/*.ps1  (deploy, smoke test, rollback)
    version.json      versión, commit, rama y pipeline de origen

  Las dependencias se instalan en el servidor con npm ci --omit=dev.
#>
param(
  [Parameter(Mandatory = $true)][string]$Version,
  [string]$Salida = 'release'
)

$ErrorActionPreference = 'Stop'

function Ruta([string[]]$Partes) {
  return [System.IO.Path]::Combine($Partes)
}

$raiz = (Resolve-Path (Ruta @($PSScriptRoot, '..', '..'))).Path
$paquete = Ruta @($raiz, 'paquete')
$dist = Ruta @($raiz, 'frontend', 'dist')

if (-not (Test-Path (Ruta @($dist, 'index.html')))) {
  throw 'No existe frontend/dist/index.html: este job necesita el artefacto del job frontend.'
}

if (Test-Path $paquete) { Remove-Item -Path $paquete -Recurse -Force }
$destinoBackend = Ruta @($paquete, 'backend')
New-Item -ItemType Directory -Path $destinoBackend -Force | Out-Null

$excluir = @('node_modules', 'coverage', 'reports', 'public', '.env')
Get-ChildItem -Path (Ruta @($raiz, 'backend')) -Force |
  Where-Object { $excluir -notcontains $_.Name } |
  Copy-Item -Destination $destinoBackend -Recurse -Force

Copy-Item -Path $dist -Destination (Ruta @($destinoBackend, 'public')) -Recurse

$migraciones = Ruta @($paquete, 'database', 'migrations')
New-Item -ItemType Directory -Path $migraciones -Force | Out-Null
Copy-Item -Path (Ruta @($raiz, 'database', 'migrations', '*.sql')) -Destination $migraciones

$scripts = Ruta @($paquete, 'devops', 'scripts')
New-Item -ItemType Directory -Path $scripts -Force | Out-Null
Copy-Item -Path (Ruta @($raiz, 'devops', 'scripts', '*.ps1')) -Destination $scripts

$info = [ordered]@{
  version  = $Version
  commit   = $env:CI_COMMIT_SHA
  rama     = $env:CI_COMMIT_REF_NAME
  pipeline = $env:CI_PIPELINE_URL
  fecha    = (Get-Date).ToUniversalTime().ToString('o')
}
$info | ConvertTo-Json | Set-Content -Path (Ruta @($paquete, 'version.json')) -Encoding ascii

$carpetaSalida = Ruta @($raiz, $Salida)
New-Item -ItemType Directory -Path $carpetaSalida -Force | Out-Null
$zip = Ruta @($carpetaSalida, "incident-hub-$Version.zip")
if (Test-Path $zip) { Remove-Item -Path $zip -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($paquete, $zip)

$tamano = [math]::Round((Get-Item $zip).Length / 1KB)
Write-Host "Paquete creado: $Salida/incident-hub-$Version.zip ($tamano KB)"
