<#
.SYNOPSIS
  Verifica la versión SemVer de la aplicación antes de construir.

.DESCRIPTION
  - backend/package.json y frontend/package.json deben tener la misma versión.
  - Si el pipeline corre por un tag (CI_COMMIT_TAG), el tag debe ser exactamente v<versión>.
  - Escribe version.env (APP_VERSION=<versión>) para que GitLab pase la versión
    a los jobs siguientes (artifacts:reports:dotenv).
#>
param(
  [string]$Salida = 'version.env'
)

$ErrorActionPreference = 'Stop'

function Ruta([string[]]$Partes) {
  return [System.IO.Path]::Combine($Partes)
}

function Leer-Version([string]$Archivo) {
  return (Get-Content -Path $Archivo -Raw | ConvertFrom-Json).version
}

$raiz = (Resolve-Path (Ruta @($PSScriptRoot, '..', '..'))).Path
$backend = Leer-Version (Ruta @($raiz, 'backend', 'package.json'))
$frontend = Leer-Version (Ruta @($raiz, 'frontend', 'package.json'))
$semver = '^\d+\.\d+\.\d+(-[0-9A-Za-z][0-9A-Za-z.-]*)?$'

if ($backend -notmatch $semver) {
  Write-Host "ERROR: la versión '$backend' de backend/package.json no cumple Semantic Versioning."
  exit 1
}
if ($backend -ne $frontend) {
  Write-Host "ERROR: versiones distintas: backend $backend / frontend $frontend. Deben coincidir."
  exit 1
}

$tag = $env:CI_COMMIT_TAG
if ($tag -and $tag -ne "v$backend") {
  Write-Host "ERROR: el tag $tag no coincide con la versión $backend de package.json (se esperaba v$backend)."
  exit 1
}

Set-Content -Path $Salida -Value "APP_VERSION=$backend" -Encoding ascii
Write-Host "Versión de la aplicación: $backend"
if ($tag) { Write-Host "Tag verificado: $tag" }
