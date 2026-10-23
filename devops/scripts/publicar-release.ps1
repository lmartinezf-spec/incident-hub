<#
.SYNOPSIS
  Publica el paquete en el Package Registry de GitLab y crea el Release del tag.

.DESCRIPTION
  Lo invoca el job release de .gitlab-ci.yml (solo en tags vX.Y.Z y vX.Y.Z-rc.N).
  Usa CI_JOB_TOKEN: no requiere tokens personales.
    1. PUT  /projects/:id/packages/generic/incident-hub/<versión>/incident-hub-<versión>.zip
    2. POST /projects/:id/releases  (notas tomadas de CHANGELOG.md y enlace al paquete)
#>
param(
  [Parameter(Mandatory = $true)][string]$Version
)

$ErrorActionPreference = 'Stop'

function Ruta([string[]]$Partes) {
  return [System.IO.Path]::Combine($Partes)
}

foreach ($nombre in @('CI_API_V4_URL', 'CI_PROJECT_ID', 'CI_COMMIT_TAG', 'CI_JOB_TOKEN')) {
  if (-not [Environment]::GetEnvironmentVariable($nombre)) {
    throw "Falta la variable ${nombre}: este script solo se ejecuta dentro de un pipeline de tag."
  }
}

$raiz = (Resolve-Path (Ruta @($PSScriptRoot, '..', '..'))).Path
$archivo = "incident-hub-$Version.zip"
$zip = Ruta @($raiz, 'release', $archivo)
if (-not (Test-Path $zip)) {
  throw "No se encontró release/$archivo (artefacto del job empaquetar)."
}

$api = $env:CI_API_V4_URL.TrimEnd('/')
$proyecto = $env:CI_PROJECT_ID
$encabezados = @{ 'JOB-TOKEN' = $env:CI_JOB_TOKEN }
$urlPaquete = "$api/projects/$proyecto/packages/generic/incident-hub/$Version/$archivo"

Write-Host "1/2 Publicando $archivo en el Package Registry..."
Invoke-RestMethod -Method Put -Uri $urlPaquete -Headers $encabezados -InFile $zip -ContentType 'application/zip' | Out-Null

$archivoNotas = Ruta @($raiz, 'release', 'notas.md')
& node (Ruta @($raiz, 'devops', 'scripts', 'notas-release.js')) $Version (Ruta @($raiz, 'CHANGELOG.md')) $archivoNotas
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron extraer las notas de CHANGELOG.md.' }
$notas = (Get-Content -Path $archivoNotas -Raw -Encoding UTF8).Trim()

$candidato = $Version.Contains('-')
$titulo = if ($candidato) { "IT Incident Hub $($env:CI_COMMIT_TAG) (candidato)" } else { "IT Incident Hub $($env:CI_COMMIT_TAG)" }
$cuerpo = [ordered]@{
  name        = $titulo
  tag_name    = $env:CI_COMMIT_TAG
  description = "$notas`n`n---`nPipeline: $($env:CI_PIPELINE_URL)"
  assets      = @{
    links = @(
      @{ name = $archivo; url = $urlPaquete; link_type = 'package' }
    )
  }
}
$json = $cuerpo | ConvertTo-Json -Depth 6

Write-Host "2/2 Creando el release $($env:CI_COMMIT_TAG)..."
$release = Invoke-RestMethod -Method Post -Uri "$api/projects/$proyecto/releases" -Headers $encabezados `
  -ContentType 'application/json; charset=utf-8' -Body ([System.Text.Encoding]::UTF8.GetBytes($json))

Write-Host "Release publicado: $($release.name)"
Write-Host "Paquete: $urlPaquete"
