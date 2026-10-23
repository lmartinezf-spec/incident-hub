<#
.SYNOPSIS
  Vuelve a la versión anterior de un ambiente.

.DESCRIPTION
  - Automático: lo invoca revertir-ci.ps1 (after_script del job) si falla el despliegue o el smoke test.
  - Manual:     .\rollback.ps1 -Ambiente production -Forzar

  Sin -Forzar solo revierte si el despliegue que falló llegó a activar la nueva versión
  (marcador "activado-por-ultimo-despliegue"). Si el fallo ocurrió antes de activar,
  la versión actual sigue siendo la buena y solo se reinicia.
  Las migraciones de base de datos no se revierten: deben ser compatibles hacia atrás.
#>
param(
  [Parameter(Mandatory = $true)][ValidateSet('staging', 'production')][string]$Ambiente,
  [string]$RaizDespliegue = 'C:\incident-hub',
  [switch]$Forzar
)

$ErrorActionPreference = 'Stop'

function Ruta([string[]]$Partes) {
  return [System.IO.Path]::Combine($Partes)
}

function Invocar-Pm2([string[]]$Argumentos) {
  $previo = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & pm2 @Argumentos
  $ErrorActionPreference = $previo
}

$env:PM2_HOME = Ruta @($RaizDespliegue, '.pm2')

$destino = Ruta @($RaizDespliegue, $Ambiente)
$actual = Ruta @($destino, 'current')
$anterior = Ruta @($destino, 'previous')
$marcador = Ruta @($destino, 'activado-por-ultimo-despliegue')
$proceso = "incident-hub-$Ambiente"

if (-not $Forzar -and -not (Test-Path $marcador)) {
  Write-Host 'El despliegue fallido no llegó a activar la nueva versión; se reinicia la versión actual.'
  if (Test-Path $actual) { Invocar-Pm2 @('restart', $proceso) }
  exit 0
}

if (-not (Test-Path $anterior)) {
  Write-Host "AVISO: no hay versión anterior en $anterior; no se puede revertir."
  exit 0
}

$fallida = Ruta @($destino, ('fallida-' + (Get-Date -Format 'yyyyMMdd-HHmmss')))
Write-Host "Revirtiendo $Ambiente a la versión anterior..."
Invocar-Pm2 @('delete', $proceso)
Move-Item $actual $fallida
Move-Item $anterior $actual
Remove-Item $marcador -Force -ErrorAction SilentlyContinue

$carpetaBackend = Ruta @($actual, 'backend')
Invocar-Pm2 @('start', (Ruta @($carpetaBackend, 'server.js')), '--name', $proceso, '--cwd', $carpetaBackend, '--time')
Invocar-Pm2 @('save')

$version = (Get-Content (Ruta @($actual, 'version.json')) -Raw | ConvertFrom-Json).version
Write-Host "Rollback completado: $Ambiente vuelve a v$version. La versión fallida quedó en $fallida para diagnóstico."
