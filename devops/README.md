# DevOps

| Archivo | Uso |
|---|---|
| `scripts/verificar-version.ps1` | Job `version`: SemVer, versiones iguales y tag coherente; publica `APP_VERSION` |
| `scripts/auditoria.js` | Job `dependencias` y GitHub Actions: `npm audit` con reporte Markdown y umbral de bloqueo |
| `scripts/empaquetar.ps1` | Job `empaquetar`: arma `release/incident-hub-<versión>.zip` |
| `scripts/desplegar-ci.ps1` | Jobs de despliegue: extrae el paquete y ejecuta deploy + smoke test |
| `scripts/deploy.ps1` | Instala la versión en el equipo del runner: `.env`, dependencias, migraciones, PM2 |
| `scripts/smoke-test.ps1` | Verifica API, base de datos, versión, frontend y autenticación |
| `scripts/revertir-ci.ps1` | `after_script` de los despliegues: rollback si el job falló |
| `scripts/rollback.ps1` | Restaura la versión anterior de un ambiente (automático o manual) |
| `scripts/publicar-release.ps1` | Job `release`: Package Registry + Release de GitLab con `CI_JOB_TOKEN` |
| `scripts/notas-release.js` | Extrae la sección de una versión de `CHANGELOG.md` |
| `scripts/esperar-pipeline-gitlab.js` | GitHub Actions: espera el pipeline de GitLab y lo refleja como check del PR |

El pipeline principal está en la raíz (`.gitlab-ci.yml`) y los workflows de GitHub en `.github/workflows/`.

Prueba manual de un despliegue en el equipo del runner (con las variables del ambiente definidas en la sesión y un paquete en `release/`):

```powershell
.\devops\scripts\desplegar-ci.ps1 -Ambiente staging -Puerto 4001
```
