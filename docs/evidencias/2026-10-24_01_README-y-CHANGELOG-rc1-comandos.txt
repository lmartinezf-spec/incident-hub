PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> git checkout -b release/v1.0.0-rc.1
Switched to a new branch 'release/v1.0.0-rc.1'
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> ..\integrante.ps1 2
Commits como: Luis - Frontend <luisalbertomafra@gmail.com>
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> Copy-Item ..\incident-hub-final\README.md README.md
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $ruta = (Resolve-Path README.md).Path
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = [IO.File]::ReadAllText($ruta) -replace "`r`n", "`n"
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t -replace '<!-- Reemplaza <grupo>[^\n]*-->\n', ''
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t.Replace('<grupo>', 'incident-hub-lmf').Replace('<usuario>', 'lmartinezf-spec')
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t.Replace('<usuario-1>', 'luismart005').Replace('<usuario-gitlab-1>', 'AlbertoMUMG')
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t.Replace('<usuario-2>', 'luisalbertomafra-lang').Replace('<usuario-gitlab-2>', 'LuisFUMG')
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t.Replace('<usuario-3>', 'lmartinezf-spec').Replace('<usuario-gitlab-3>', 'LuisUMG')
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t.Replace('PostgreSQL 16', 'PostgreSQL 16+')
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> [IO.File]::WriteAllText($ruta, $t, [Text.UTF8Encoding]::new($false))
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> Select-String -Path README.md -Pattern '<grupo>|<usuario'
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> Select-String -Path README.md -Pattern 'AlbertoMUMG|LuisFUMG|LuisUMG'

README.md:134:| Integrante 1 | Backend · Tech Lead | API, base de datos, seguridad de la aplicación, aprobación de
producción | `@luismart005` | `@AlbertoMUMG` |
README.md:135:| Integrante 2 | Frontend | Interfaz React, dashboard, pruebas de frontend | `@luisalbertomafra-lang` |
`@LuisFUMG` |
README.md:136:| Integrante 3 | DevOps · QA | Pipelines, runner, espejo, pruebas, release | `@lmartinezf-spec` |
`@LuisUMG` |


PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $ruta = (Resolve-Path CHANGELOG.md).Path
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $hoy = Get-Date -Format 'yyyy-MM-dd'
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = [IO.File]::ReadAllText($ruta) -replace "`r`n", "`n"
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $seccion = "## [1.0.0-rc.1] - $hoy`n`n### Cambiado`n- README con requisitos, instalación, ejecución, enlaces del proyecto y responsables del equipo.`n- Versión 1.0.0-rc.1 en backend y frontend: candidato a release, solo Staging.`n`n"
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t.Replace('## [0.5.0]', $seccion + '## [0.5.0]')
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t.Replace('<usuario>', 'lmartinezf-spec')
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $base = 'https://github.com/lmartinezf-spec/incident-hub/compare'
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> if ($t -match '(?m)^\[0\.5\.0\]:' -and $t -notmatch '(?m)^\[1\.0\.0-rc\.1\]:') {
>>   $t = $t -replace '(?m)^\[0\.5\.0\]:', "[1.0.0-rc.1]: $base/v0.5.0...v1.0.0-rc.1`n[0.5.0]:"
>> }
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> $t = $t -replace '(?m)^\[Sin publicar\]:.*$', "[Sin publicar]: $base/v1.0.0-rc.1...HEAD"
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> [IO.File]::WriteAllText($ruta, $t, [Text.UTF8Encoding]::new($false))
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> Select-String -Path CHANGELOG.md -Pattern '^## \[' | Select-Object -First 3

CHANGELOG.md:6:## [Sin publicar]
CHANGELOG.md:8:## [1.0.0-rc.1] - 2026-10-24
CHANGELOG.md:14:## [0.5.0] - 2026-10-23


PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub> git status
On branch release/v1.0.0-rc.1
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   CHANGELOG.md
        modified:   README.md

no changes added to commit (use "git add" and/or "git commit -a")
PS C:\Users\Micro Quetzal\Desktop\proyecto\incident-hub>