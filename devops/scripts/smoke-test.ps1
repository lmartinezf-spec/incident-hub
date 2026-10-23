<#
.SYNOPSIS
  Valida un ambiente recién desplegado: API, base de datos, versión y frontend.
  Si falla, el job de GitLab falla y after_script ejecuta el rollback automático.
#>
param(
  [Parameter(Mandatory = $true)][int]$Puerto,
  [Parameter(Mandatory = $true)][string]$ArchivoVersion,
  [int]$Intentos = 10,
  [int]$EsperaSegundos = 3
)

$ErrorActionPreference = 'Stop'
$esperada = (Get-Content $ArchivoVersion -Raw | ConvertFrom-Json).version
$base = "http://localhost:$Puerto"

for ($i = 1; $i -le $Intentos; $i++) {
  try {
    $salud = Invoke-RestMethod -Uri "$base/api/health" -TimeoutSec 5
    if ($salud.status -eq 'ok' -and $salud.baseDatos -eq 'ok' -and $salud.version -eq $esperada) {
      $pagina = Invoke-WebRequest -Uri "$base/" -UseBasicParsing -TimeoutSec 5
      if ($pagina.Content -notmatch 'id="root"') { throw 'El frontend no respondió con la aplicación React' }

      $login = $null
      try {
        Invoke-RestMethod -Uri "$base/api/incidentes" -TimeoutSec 5 | Out-Null
      } catch {
        $login = $_.Exception.Response.StatusCode.value__
      }
      if ($login -ne 401) { throw "La API debería exigir autenticación (respondió $login)" }

      Write-Host "Smoke test OK: v$($salud.version), base de datos $($salud.baseDatos), frontend y seguridad verificados."
      exit 0
    }
    Write-Host "Intento ${i}: status=$($salud.status) baseDatos=$($salud.baseDatos) version=$($salud.version) (esperada $esperada)"
  } catch {
    Write-Host "Intento ${i}: $($_.Exception.Message)"
  }
  Start-Sleep -Seconds $EsperaSegundos
}

Write-Host "ERROR: smoke test falló: $base no respondió con la versión $esperada"
exit 1
