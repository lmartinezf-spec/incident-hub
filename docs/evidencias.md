# Índice de evidencias

Enlaces directos para revisar el proceso del 16 al 25 de octubre de 2026. El historial completo se puede reconstruir desde GitLab (work items, pipelines, ambientes, releases) y GitHub (commits, PRs, Actions); esta página solo facilita la navegación. Las capturas están en [`docs/evidencias/`](evidencias/) con el formato `AAAA-MM-DD_NN_descripcion` y no muestran secretos (los valores de las variables aparecen ocultos y la IP del runner está tapada). Equivalencias con el enunciado en [herramientas.md](herramientas.md).

| | Enlace |
|---|---|
| Proyecto de GitLab (backlog, pipelines, ambientes, releases) | https://gitlab.com/incident-hub-lmf/incident-hub |
| Repositorio de GitHub (código, PRs, Actions) | https://github.com/lmartinezf-spec/incident-hub |

## Requisitos y evidencia

| Requisito | Evidencia | Capturas | Enlace |
|---|---|---|---|
| Backlog | 2 Epics · 9 Features (epics hijos) · 23 User Stories · 40 Tasks, más 2 Bugs (#64, #65) | [2026-10-25_06](evidencias/2026-10-25_06_Epica-1-plataforma-arbol-cerrada.png), [2026-10-25_07](evidencias/2026-10-25_07_Epica-2-DevOps-arbol.png) | https://gitlab.com/groups/incident-hub-lmf/-/epics |
| Tablero | Work items por estado | [2026-10-25_10](evidencias/2026-10-25_10_Tablero-estado-final.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/boards |
| Sprints | Milestones Sprint 1 (16–19 oct), Sprint 2 (20–22 oct) y Sprint 3 (23–25 oct) con burndown | [2026-10-20_01](evidencias/2026-10-20_01_Hitos-Sprint1-100.png), [2026-10-20_02](evidencias/2026-10-20_02_Sprint1-burndown-burnup.png), [2026-10-22_04](evidencias/2026-10-22_04_Hitos-Sprint2-22de22-Sprint3-10.png), [2026-10-22_05](evidencias/2026-10-22_05_Sprint2-burndown.png), [2026-10-22_06](evidencias/2026-10-22_06_Sprint2-burnup-y-completados.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/milestones |
| Trazabilidad | Tarea #38 con *"mentioned in commit"* y cerrada por el merge del PR | [2026-10-19_02](evidencias/2026-10-19_02_GitLab-tarea-38-cerrada-por-merge.png), [2026-10-18_01](evidencias/2026-10-18_01_PR3-abierto-con-Closes.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/work_items/38 |
| Pull Requests | 13 PRs con revisión y checks obligatorios | [2026-10-18_01](evidencias/2026-10-18_01_PR3-abierto-con-Closes.png), [2026-10-23_03](evidencias/2026-10-23_03_PR11-aprobado-checks-en-verde.png), [2026-10-24_05](evidencias/2026-10-24_05_PR12-5-checks-en-verde-tras-correccion.png), [2026-10-24_08](evidencias/2026-10-24_08_PR13-release-v1.0.0-abierto.png) | https://github.com/lmartinezf-spec/incident-hub/pulls?q=is%3Apr+is%3Aclosed |
| Code review | Cada PR revisado y aprobado por otro integrante, con comentarios de revisión (PR 1 a 11) y *dismiss stale approvals*; ejemplo: PR 6, bloqueado por el check *Pipeline de GitLab* en rojo hasta la corrección | [2026-10-20_08](evidencias/2026-10-20_08_Captura3-PR6-check-Required-rojo.png) | https://github.com/lmartinezf-spec/incident-hub/pull/6 |
| Pipeline fallido | Job `backend` en rojo: `Falta la variable de entorno requerida: JWT_SECRET` | [2026-10-20_04](evidencias/2026-10-20_04_Captura1-pipeline-en-rojo.png), [2026-10-20_05](evidencias/2026-10-20_05_Captura1-detalle-backend-fallido.png), [2026-10-20_06](evidencias/2026-10-20_06_Captura2-log-falta-JWT_SECRET.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/pipelines/2968922229 |
| Diagnóstico y corrección | Bug #64 + commit `fix(ci): mapear JWT_SECRET_TEST en el job de pruebas GL-64 GL-49` | [2026-10-20_07](evidencias/2026-10-20_07_Bug-64-creado.png), [2026-10-20_09](evidencias/2026-10-20_09_Pipelines-error-y-correccion.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/work_items/64 · https://github.com/lmartinezf-spec/incident-hub/commit/1060313281af475bd2ec2a1b83dd81d1ba107caf |
| Pipeline exitoso | Pipeline posterior en verde y check del PR 6 en verde | [2026-10-20_09](evidencias/2026-10-20_09_Pipelines-error-y-correccion.png), [2026-10-20_10](evidencias/2026-10-20_10_Pipelines-version-0.3.0.png), [2026-10-20_11](evidencias/2026-10-20_11_Pipelines-main-y-tag-v0.3.0.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/pipelines/2968976908 |
| Check obligatorio en PR | Ruleset `proteccion-main`: 1 aprobación y 4 checks requeridos | [2026-10-20_08](evidencias/2026-10-20_08_Captura3-PR6-check-Required-rojo.png), [2026-10-22_03](evidencias/2026-10-22_03_Ruleset-4-checks-obligatorios.png) | https://github.com/lmartinezf-spec/incident-hub/rules |
| Runner autohospedado | Runner `incident-hub-pc` (shell, Windows) *online*; todos los jobs corren en él | [2026-10-20_03](evidencias/2026-10-20_03_Runner-autohospedado-en-linea.png) | GitLab → Configuración → CI/CD → Runners |
| Secretos | Variables enmascaradas y protegidas con ámbito por ambiente (sin mostrar valores); tags `v*` protegidos | [2026-10-23_01](evidencias/2026-10-23_01_Variables-CI-por-ambiente-sin-valores.png), [2026-10-23_11](evidencias/2026-10-23_11_Etiquetas-protegidas-0-causa.png) | GitLab → Configuración → CI/CD → Variables |
| GitHub Actions | `sincronizar-gitlab.yml` (espejo + check del pipeline) y `validacion-pr.yml` (lint, pruebas, build, dependencias) | [2026-10-18_02](evidencias/2026-10-18_02_Actions-tag-v0.1.0.png), [2026-10-19_01](evidencias/2026-10-19_01_Actions-PR4-espejo-y-pipeline-verde.png), [2026-10-19_03](evidencias/2026-10-19_03_Actions-merge-PR4.png), [2026-10-22_01](evidencias/2026-10-22_01_PR9-checks-nuevos-1-fallando.png), [2026-10-22_02](evidencias/2026-10-22_02_PR9-error-Dependency-graph-desactivado.png) | https://github.com/lmartinezf-spec/incident-hub/actions |
| Dependencias | DEP-01 (riesgo aceptado) y DEP-02: `body-parser` alta, la auditoría bloqueó el PR 12 y se corrigió (Bug #65) | [2026-10-24_02](evidencias/2026-10-24_02_PR12-checks-fallan-por-auditoria.png), [2026-10-24_03](evidencias/2026-10-24_03_npm-audit-body-parser-high-y-correccion.txt), [2026-10-24_04](evidencias/2026-10-24_04_Bug-65-DEP-02-body-parser.png), [2026-10-24_05](evidencias/2026-10-24_05_PR12-5-checks-en-verde-tras-correccion.png) | [dependencias.md](dependencias.md) · https://gitlab.com/incident-hub-lmf/incident-hub/-/work_items/65 |
| Deuda técnica | 7 deudas identificadas, 2 resueltas: TD-01 (índices, 4.525 ms → 0.087 ms) y TD-02 (límite de login, HTTP 429) | [2026-10-21_01](evidencias/2026-10-21_01_TD-01-antes-Seq-Scan-4.525ms.png), [2026-10-21_02](evidencias/2026-10-21_02_TD-01-despues-Index-Scan-0.087ms.png), [2026-10-21_05](evidencias/2026-10-21_05_TD-02-sexto-intento-429.png) | [deuda-tecnica.md](deuda-tecnica.md) · PR 7 y PR 8 |
| Artefactos | `incident-hub-X.Y.Z.zip` por pipeline de `main` y de tags; paquetes en el Package Registry | [2026-10-21_04](evidencias/2026-10-21_04_Pipeline-tag-v0.3.1-5-jobs-114-pruebas.png), [2026-10-25_09](evidencias/2026-10-25_09_Package-Registry-1.0.0-y-1.0.0-rc.1.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/packages |
| Versiones | Tags v0.1.0 → v1.0.0 (SemVer) y [CHANGELOG](../CHANGELOG.md) | [2026-10-18_03](evidencias/2026-10-18_03_GitHub-tags-v0.1.0.png), [2026-10-18_04](evidencias/2026-10-18_04_GitLab-tags-v0.1.0.png), [2026-10-19_04](evidencias/2026-10-19_04_GitHub-tags-v0.2.0.png), [2026-10-20_12](evidencias/2026-10-20_12_GitLab-tags-v0.3.0.png), [2026-10-21_06](evidencias/2026-10-21_06_GitLab-tags-v0.1.0-a-v0.3.2.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/tags |
| Ambiente Staging | Despliegue automático desde `main` y tags, smoke test y PM2 | [2026-10-23_02](evidencias/2026-10-23_02_Ambiente-production-protegido-regla-aprobacion.png), [2026-10-23_05](evidencias/2026-10-23_05_Pipelines-main-con-despliegue-staging.png), [2026-10-23_06](evidencias/2026-10-23_06_Pipeline-main-2983099920-aprobado.png), [2026-10-23_07](evidencias/2026-10-23_07_PM2-incident-hub-staging-online.png), [2026-10-23_19](evidencias/2026-10-23_19_Health-staging-v0.5.0-baseDatos-ok.png), [2026-10-23_20](evidencias/2026-10-23_20_Dashboard-staging-v0.5.0.png), [2026-10-24_06](evidencias/2026-10-24_06_Health-staging-v1.0.0-rc.1.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/environments |
| Fallo controlado de despliegue | Tag v0.5.0 sin variables protegidas: el job se detiene sin tocar staging; se protegen los tags `v*` | [2026-10-23_08](evidencias/2026-10-23_08_Pipeline-tag-v0.5.0-error.png), [2026-10-23_09](evidencias/2026-10-23_09_Pipeline-2983112447-deploy-staging-fallido.png), [2026-10-23_10](evidencias/2026-10-23_10_Log-falta-DB_PASSWORD-tag-no-protegido.png), [2026-10-23_11](evidencias/2026-10-23_11_Etiquetas-protegidas-0-causa.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/pipelines/2983112447 |
| Aprobación rechazada | v0.5.0 rechazada por AlbertoMUMG con justificación; el job de producción no se ejecuta | [2026-10-23_12](evidencias/2026-10-23_12_Pipeline-2983159848-bloqueado-espera-aprobacion.png), [2026-10-23_13](evidencias/2026-10-23_13_Ambientes-production-necesita-aprobacion.png), [2026-10-23_14](evidencias/2026-10-23_14_Historial-implementaciones-production.png), [2026-10-23_15](evidencias/2026-10-23_15_Aprobacion-comentario-antes-de-rechazar.png), [2026-10-23_16](evidencias/2026-10-23_16_Pipeline-2983159848-produccion-rechazada.png), [2026-10-23_17](evidencias/2026-10-23_17_Job-deploy-produccion-rejected-sin-ejecutar.png), [2026-10-23_18](evidencias/2026-10-23_18_Implementacion-5-rechazada-por-AlbertoMUMG.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/environments/41958371/deployments/5 |
| Aprobación y Producción | v1.0.0 aprobada por AlbertoMUMG, ejecutada por el Integrante 3, smoke test en verde | [2026-10-25_01](evidencias/2026-10-25_01_Produccion-v1.0.0-aprobada-por-AlbertoMUMG.png), [2026-10-25_02](evidencias/2026-10-25_02_Pipeline-v1.0.0-listo-para-ejecutar-produccion.png), [2026-10-25_03](evidencias/2026-10-25_03_Pipeline-v1.0.0-produccion-y-release-passed.png), [2026-10-25_04](evidencias/2026-10-25_04_PM2-resurrect-production-y-staging-online.png), [2026-10-25_05](evidencias/2026-10-25_05_Health-produccion-v1.0.0-baseDatos-ok.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/environments/41958371/deployments/10 · https://gitlab.com/incident-hub-lmf/incident-hub/-/pipelines/2985969029 |
| Release | Candidato v1.0.0-rc.1 (24 oct, solo Staging) y v1.0.0 (25 oct, Producción), con notas del CHANGELOG, paquete y evidencia | [2026-10-24_07](evidencias/2026-10-24_07_Release-candidato-v1.0.0-rc.1-con-paquete.png), [2026-10-25_08](evidencias/2026-10-25_08_Releases-v1.0.0-y-v1.0.0-rc.1.png) | https://gitlab.com/incident-hub-lmf/incident-hub/-/releases |

## Contribuciones por integrante

Los tres integrantes trabajan con cuentas separadas en GitHub y GitLab; los commits se firman con el nombre y correo de cada rol.

| Integrante | GitHub | GitLab | Commits (sin merges) | PRs abiertos | PRs aprobados como revisor | Merges realizados |
|---|---|---|---|---|---|---|
| Integrante 1 — Backend · Tech Lead | `luismart005` | `AlbertoMUMG` | 19 | 6 (#2, #3, #5, #7, #8, #10) | 5 (#1, #4, #6, #11, #13) | 7 |
| Integrante 2 — Frontend | `luisalbertomafra-lang` | `LuisFUMG` | 10 | 3 (#4, #11, #12) | 3 (#3, #8, #9) | 1 |
| Integrante 3 — DevOps · QA | `lmartinezf-spec` | `LuisUMG` | 16 | 4 (#1, #6, #9, #13) | 5 (#2, #5, #7, #10, #12) | 5 |
| **Total** | | | **45** | **13** | **13** | **13** |

- Conteo hasta la v1.0.0 (PR 1 a 13). Ningún PR fue aprobado por su autor: el ruleset exige 1 aprobación de otra cuenta.
- El PR 11 lo abrió el Integrante 2; sus commits son del Integrante 3 (DevOps).
- Este índice llega con el PR 14 (Integrante 1, revisado por el Integrante 2).
- Producción en GitLab: AlbertoMUMG (Integrante 1) aprueba o rechaza; LuisUMG (Integrante 3) ejecuta el despliegue.
- Bugs: #64 (pipeline, corregido por el Integrante 3) y #65 (dependencia, registrado por el Integrante 3 y corregido por el Integrante 1).

## Guion de la demostración

Recorrido de 10 a 15 minutos para la defensa. Antes de empezar: runner en línea (`gitlab-runner run`), PM2 con las dos apps (`pm2 resurrect` y `pm2 ls`) y las sesiones de GitHub y GitLab abiertas.

1. **Necesidad y backlog.** GitLab → Epics en vista de árbol: épica de negocio → features → historias → tareas, con responsable, prioridad, peso y sprint.
2. **Sprints y tablero.** Milestones con fechas y burndown; tablero con columnas por estado.
3. **Trazabilidad.** Abrir la tarea #38: *mentioned in commit* (`GL-38`) y cerrada por el merge del PR con `Closes`.
4. **Ramas y PR.** GitHub → un PR cerrado: plantilla, revisión aprobada y los 4 checks obligatorios del ruleset `proteccion-main`.
5. **Pipeline principal.** GitLab → Pipelines: validar, pruebas (115 pruebas con reportes), seguridad, empaquetar; todo en el runner `incident-hub-pc`.
6. **Fallo y corrección.** Pipeline 2968922229 en rojo (JWT_SECRET) → Bug #64 → commit de corrección → pipeline en verde.
7. **Seguridad.** Variables protegidas y enmascaradas por ambiente; DEP-02: la auditoría bloqueó el release por `body-parser` y se corrigió antes de publicar.
8. **Deuda técnica.** TD-01 con EXPLAIN antes/después y TD-02 con el HTTP 429; las 5 restantes quedan registradas en el backlog.
9. **Staging.** http://localhost:4001: login con los tres roles (administrador, técnico y usuario), flujo de un incidente y versión en la barra lateral.
10. **Producción con aprobación.** Ambiente `production`: v0.5.0 rechazada con justificación y v1.0.0 aprobada por el Integrante 1; http://localhost:4000/api/health muestra 1.0.0.
11. **Release.** GitLab → Releases: v1.0.0-rc.1 (candidato) y v1.0.0 con notas del CHANGELOG y paquete en el Package Registry. Explicar el rollback automático (`after_script`) y manual (`rollback.ps1`).

## Todas las capturas

| Archivo | Día |
|---|---|
| [2026-10-18_01_PR3-abierto-con-Closes.png](evidencias/2026-10-18_01_PR3-abierto-con-Closes.png) | 2026-10-18 |
| [2026-10-18_02_Actions-tag-v0.1.0.png](evidencias/2026-10-18_02_Actions-tag-v0.1.0.png) | 2026-10-18 |
| [2026-10-18_03_GitHub-tags-v0.1.0.png](evidencias/2026-10-18_03_GitHub-tags-v0.1.0.png) | 2026-10-18 |
| [2026-10-18_04_GitLab-tags-v0.1.0.png](evidencias/2026-10-18_04_GitLab-tags-v0.1.0.png) | 2026-10-18 |
| [2026-10-19_01_Actions-PR4-espejo-y-pipeline-verde.png](evidencias/2026-10-19_01_Actions-PR4-espejo-y-pipeline-verde.png) | 2026-10-19 |
| [2026-10-19_02_GitLab-tarea-38-cerrada-por-merge.png](evidencias/2026-10-19_02_GitLab-tarea-38-cerrada-por-merge.png) | 2026-10-19 |
| [2026-10-19_03_Actions-merge-PR4.png](evidencias/2026-10-19_03_Actions-merge-PR4.png) | 2026-10-19 |
| [2026-10-19_04_GitHub-tags-v0.2.0.png](evidencias/2026-10-19_04_GitHub-tags-v0.2.0.png) | 2026-10-19 |
| [2026-10-20_01_Hitos-Sprint1-100.png](evidencias/2026-10-20_01_Hitos-Sprint1-100.png) | 2026-10-20 |
| [2026-10-20_02_Sprint1-burndown-burnup.png](evidencias/2026-10-20_02_Sprint1-burndown-burnup.png) | 2026-10-20 |
| [2026-10-20_03_Runner-autohospedado-en-linea.png](evidencias/2026-10-20_03_Runner-autohospedado-en-linea.png) | 2026-10-20 |
| [2026-10-20_04_Captura1-pipeline-en-rojo.png](evidencias/2026-10-20_04_Captura1-pipeline-en-rojo.png) | 2026-10-20 |
| [2026-10-20_05_Captura1-detalle-backend-fallido.png](evidencias/2026-10-20_05_Captura1-detalle-backend-fallido.png) | 2026-10-20 |
| [2026-10-20_06_Captura2-log-falta-JWT_SECRET.png](evidencias/2026-10-20_06_Captura2-log-falta-JWT_SECRET.png) | 2026-10-20 |
| [2026-10-20_07_Bug-64-creado.png](evidencias/2026-10-20_07_Bug-64-creado.png) | 2026-10-20 |
| [2026-10-20_08_Captura3-PR6-check-Required-rojo.png](evidencias/2026-10-20_08_Captura3-PR6-check-Required-rojo.png) | 2026-10-20 |
| [2026-10-20_09_Pipelines-error-y-correccion.png](evidencias/2026-10-20_09_Pipelines-error-y-correccion.png) | 2026-10-20 |
| [2026-10-20_10_Pipelines-version-0.3.0.png](evidencias/2026-10-20_10_Pipelines-version-0.3.0.png) | 2026-10-20 |
| [2026-10-20_11_Pipelines-main-y-tag-v0.3.0.png](evidencias/2026-10-20_11_Pipelines-main-y-tag-v0.3.0.png) | 2026-10-20 |
| [2026-10-20_12_GitLab-tags-v0.3.0.png](evidencias/2026-10-20_12_GitLab-tags-v0.3.0.png) | 2026-10-20 |
| [2026-10-21_01_TD-01-antes-Seq-Scan-4.525ms.png](evidencias/2026-10-21_01_TD-01-antes-Seq-Scan-4.525ms.png) | 2026-10-21 |
| [2026-10-21_02_TD-01-despues-Index-Scan-0.087ms.png](evidencias/2026-10-21_02_TD-01-despues-Index-Scan-0.087ms.png) | 2026-10-21 |
| [2026-10-21_03_Pipeline-rama-v0.3.1-aprobado.png](evidencias/2026-10-21_03_Pipeline-rama-v0.3.1-aprobado.png) | 2026-10-21 |
| [2026-10-21_04_Pipeline-tag-v0.3.1-5-jobs-114-pruebas.png](evidencias/2026-10-21_04_Pipeline-tag-v0.3.1-5-jobs-114-pruebas.png) | 2026-10-21 |
| [2026-10-21_05_TD-02-sexto-intento-429.png](evidencias/2026-10-21_05_TD-02-sexto-intento-429.png) | 2026-10-21 |
| [2026-10-21_06_GitLab-tags-v0.1.0-a-v0.3.2.png](evidencias/2026-10-21_06_GitLab-tags-v0.1.0-a-v0.3.2.png) | 2026-10-21 |
| [2026-10-22_01_PR9-checks-nuevos-1-fallando.png](evidencias/2026-10-22_01_PR9-checks-nuevos-1-fallando.png) | 2026-10-22 |
| [2026-10-22_02_PR9-error-Dependency-graph-desactivado.png](evidencias/2026-10-22_02_PR9-error-Dependency-graph-desactivado.png) | 2026-10-22 |
| [2026-10-22_03_Ruleset-4-checks-obligatorios.png](evidencias/2026-10-22_03_Ruleset-4-checks-obligatorios.png) | 2026-10-22 |
| [2026-10-22_04_Hitos-Sprint2-22de22-Sprint3-10.png](evidencias/2026-10-22_04_Hitos-Sprint2-22de22-Sprint3-10.png) | 2026-10-22 |
| [2026-10-22_05_Sprint2-burndown.png](evidencias/2026-10-22_05_Sprint2-burndown.png) | 2026-10-22 |
| [2026-10-22_06_Sprint2-burnup-y-completados.png](evidencias/2026-10-22_06_Sprint2-burnup-y-completados.png) | 2026-10-22 |
| [2026-10-23_01_Variables-CI-por-ambiente-sin-valores.png](evidencias/2026-10-23_01_Variables-CI-por-ambiente-sin-valores.png) | 2026-10-23 |
| [2026-10-23_02_Ambiente-production-protegido-regla-aprobacion.png](evidencias/2026-10-23_02_Ambiente-production-protegido-regla-aprobacion.png) | 2026-10-23 |
| [2026-10-23_03_PR11-aprobado-checks-en-verde.png](evidencias/2026-10-23_03_PR11-aprobado-checks-en-verde.png) | 2026-10-23 |
| [2026-10-23_04_PR11-commits-con-GL.txt](evidencias/2026-10-23_04_PR11-commits-con-GL.txt) | 2026-10-23 |
| [2026-10-23_05_Pipelines-main-con-despliegue-staging.png](evidencias/2026-10-23_05_Pipelines-main-con-despliegue-staging.png) | 2026-10-23 |
| [2026-10-23_06_Pipeline-main-2983099920-aprobado.png](evidencias/2026-10-23_06_Pipeline-main-2983099920-aprobado.png) | 2026-10-23 |
| [2026-10-23_07_PM2-incident-hub-staging-online.png](evidencias/2026-10-23_07_PM2-incident-hub-staging-online.png) | 2026-10-23 |
| [2026-10-23_08_Pipeline-tag-v0.5.0-error.png](evidencias/2026-10-23_08_Pipeline-tag-v0.5.0-error.png) | 2026-10-23 |
| [2026-10-23_09_Pipeline-2983112447-deploy-staging-fallido.png](evidencias/2026-10-23_09_Pipeline-2983112447-deploy-staging-fallido.png) | 2026-10-23 |
| [2026-10-23_10_Log-falta-DB_PASSWORD-tag-no-protegido.png](evidencias/2026-10-23_10_Log-falta-DB_PASSWORD-tag-no-protegido.png) | 2026-10-23 |
| [2026-10-23_11_Etiquetas-protegidas-0-causa.png](evidencias/2026-10-23_11_Etiquetas-protegidas-0-causa.png) | 2026-10-23 |
| [2026-10-23_12_Pipeline-2983159848-bloqueado-espera-aprobacion.png](evidencias/2026-10-23_12_Pipeline-2983159848-bloqueado-espera-aprobacion.png) | 2026-10-23 |
| [2026-10-23_13_Ambientes-production-necesita-aprobacion.png](evidencias/2026-10-23_13_Ambientes-production-necesita-aprobacion.png) | 2026-10-23 |
| [2026-10-23_14_Historial-implementaciones-production.png](evidencias/2026-10-23_14_Historial-implementaciones-production.png) | 2026-10-23 |
| [2026-10-23_15_Aprobacion-comentario-antes-de-rechazar.png](evidencias/2026-10-23_15_Aprobacion-comentario-antes-de-rechazar.png) | 2026-10-23 |
| [2026-10-23_16_Pipeline-2983159848-produccion-rechazada.png](evidencias/2026-10-23_16_Pipeline-2983159848-produccion-rechazada.png) | 2026-10-23 |
| [2026-10-23_17_Job-deploy-produccion-rejected-sin-ejecutar.png](evidencias/2026-10-23_17_Job-deploy-produccion-rejected-sin-ejecutar.png) | 2026-10-23 |
| [2026-10-23_18_Implementacion-5-rechazada-por-AlbertoMUMG.png](evidencias/2026-10-23_18_Implementacion-5-rechazada-por-AlbertoMUMG.png) | 2026-10-23 |
| [2026-10-23_19_Health-staging-v0.5.0-baseDatos-ok.png](evidencias/2026-10-23_19_Health-staging-v0.5.0-baseDatos-ok.png) | 2026-10-23 |
| [2026-10-23_20_Dashboard-staging-v0.5.0.png](evidencias/2026-10-23_20_Dashboard-staging-v0.5.0.png) | 2026-10-23 |
| [2026-10-24_01_README-y-CHANGELOG-rc1-comandos.txt](evidencias/2026-10-24_01_README-y-CHANGELOG-rc1-comandos.txt) | 2026-10-24 |
| [2026-10-24_02_PR12-checks-fallan-por-auditoria.png](evidencias/2026-10-24_02_PR12-checks-fallan-por-auditoria.png) | 2026-10-24 |
| [2026-10-24_03_npm-audit-body-parser-high-y-correccion.txt](evidencias/2026-10-24_03_npm-audit-body-parser-high-y-correccion.txt) | 2026-10-24 |
| [2026-10-24_04_Bug-65-DEP-02-body-parser.png](evidencias/2026-10-24_04_Bug-65-DEP-02-body-parser.png) | 2026-10-24 |
| [2026-10-24_05_PR12-5-checks-en-verde-tras-correccion.png](evidencias/2026-10-24_05_PR12-5-checks-en-verde-tras-correccion.png) | 2026-10-24 |
| [2026-10-24_06_Health-staging-v1.0.0-rc.1.png](evidencias/2026-10-24_06_Health-staging-v1.0.0-rc.1.png) | 2026-10-24 |
| [2026-10-24_07_Release-candidato-v1.0.0-rc.1-con-paquete.png](evidencias/2026-10-24_07_Release-candidato-v1.0.0-rc.1-con-paquete.png) | 2026-10-24 |
| [2026-10-24_08_PR13-release-v1.0.0-abierto.png](evidencias/2026-10-24_08_PR13-release-v1.0.0-abierto.png) | 2026-10-24 |
| [2026-10-25_01_Produccion-v1.0.0-aprobada-por-AlbertoMUMG.png](evidencias/2026-10-25_01_Produccion-v1.0.0-aprobada-por-AlbertoMUMG.png) | 2026-10-25 |
| [2026-10-25_02_Pipeline-v1.0.0-listo-para-ejecutar-produccion.png](evidencias/2026-10-25_02_Pipeline-v1.0.0-listo-para-ejecutar-produccion.png) | 2026-10-25 |
| [2026-10-25_03_Pipeline-v1.0.0-produccion-y-release-passed.png](evidencias/2026-10-25_03_Pipeline-v1.0.0-produccion-y-release-passed.png) | 2026-10-25 |
| [2026-10-25_04_PM2-resurrect-production-y-staging-online.png](evidencias/2026-10-25_04_PM2-resurrect-production-y-staging-online.png) | 2026-10-25 |
| [2026-10-25_05_Health-produccion-v1.0.0-baseDatos-ok.png](evidencias/2026-10-25_05_Health-produccion-v1.0.0-baseDatos-ok.png) | 2026-10-25 |
| [2026-10-25_06_Epica-1-plataforma-arbol-cerrada.png](evidencias/2026-10-25_06_Epica-1-plataforma-arbol-cerrada.png) | 2026-10-25 |
| [2026-10-25_07_Epica-2-DevOps-arbol.png](evidencias/2026-10-25_07_Epica-2-DevOps-arbol.png) | 2026-10-25 |
| [2026-10-25_08_Releases-v1.0.0-y-v1.0.0-rc.1.png](evidencias/2026-10-25_08_Releases-v1.0.0-y-v1.0.0-rc.1.png) | 2026-10-25 |
| [2026-10-25_09_Package-Registry-1.0.0-y-1.0.0-rc.1.png](evidencias/2026-10-25_09_Package-Registry-1.0.0-y-1.0.0-rc.1.png) | 2026-10-25 |
| [2026-10-25_10_Tablero-estado-final.png](evidencias/2026-10-25_10_Tablero-estado-final.png) | 2026-10-25 |
