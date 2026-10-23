<#
.SYNOPSIS
  Rollback automático: se ejecuta en after_script de los jobs de despliegue.

.DESCRIPTION
  GitLab ejecuta after_script siempre. Este script solo actúa si el job falló
  (CI_JOB_STATUS = failed); en ese caso restaura la versión anterior del ambiente
  con rollback.ps1, que deploy.ps1 copió en <raíz>\scripts en el primer despliegue.
#>
param(
  [Parameter(Mandatory = $true)][ValidateSet('staging', 'production')][string]$Ambiente,
  [string]$RaizDespliegue = $(if ($env:INCIDENT_HUB_RAIZ) { $env:INCIDENT_HUB_RAIZ } else { 'C:\incident-hub' })
)

if ($env:CI_JOB_STATUS -ne 'failed') {
  Write-Host "Estado del job: $($env:CI_JOB_STATUS). No se requiere rollback."
  exit 0
}

$script = [System.IO.Path]::Combine($RaizDespliegue, 'scripts', 'rollback.ps1')
if (-not (Test-Path $script)) {
  Write-Host 'No existe un despliegue previo; no hay nada que revertir.'
  exit 0
}

Write-Host "El despliegue a $Ambiente falló. Ejecutando rollback..."
& $script -Ambiente $Ambiente -RaizDespliegue $RaizDespliegue
exit $LASTEXITCODE
