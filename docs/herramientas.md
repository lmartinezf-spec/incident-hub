# Herramientas y equivalencias

El proyecto usa **GitHub** para el código y **GitLab** para la planificación y el pipeline principal. Cada condición del enunciado que nombra un servicio de Azure DevOps se cumple con su equivalente directo:

| Condición del enunciado | Azure DevOps | En este proyecto | Dónde verlo |
|---|---|---|---|
| Backlog (Epics, Features, User Stories, Tasks) con responsable, prioridad, estimación y estado | Azure Boards | GitLab: Epics → Epics hijos (Features) → Issues (User Stories) → Tasks; responsable = assignee, prioridad = etiqueta `prioridad::*`, estimación = *Weight*, estado = abierto / `estado::en-curso` / `estado::en-revision` / cerrado | GitLab → Plan → Epics, Issues, Issue boards, Milestones |
| Trazabilidad con Work Items (`AB#ID`) | Menciones `AB#123` | Commits con `GL-123` (referencia nativa de GitLab) y PRs con `Closes <URL del work item>` | Cada work item: sección de actividad *"mentioned in commit"* |
| Pipeline: checkout, restauración, build, pruebas, dependencias, empaquetado y artefacto | Azure Pipelines (`azure-pipelines.yml`) | GitLab CI/CD (`.gitlab-ci.yml`) | GitLab → Build → Pipelines |
| Agente autohospedado | Self-hosted agent | GitLab Runner propio (executor shell, Windows) | GitLab → Settings → CI/CD → Runners |
| Secretos protegidos | Library / variable groups | GitLab CI/CD variables enmascaradas, protegidas y con ámbito por ambiente; GitHub Actions secrets | GitLab → Settings → CI/CD → Variables |
| Publicación de artefacto | Pipeline artifacts / Azure Artifacts | Artefactos de job + Package Registry (paquete genérico) | GitLab → Build → Artifacts; Deploy → Package Registry |
| Ambientes con aprobación | Environments + Approvals | Environments `staging` / `production`; producción manual y protegida con aprobación | GitLab → Operate → Environments |
| Release | Release pipeline | GitLab Releases (tag + notas del CHANGELOG + paquete) | GitLab → Deploy → Releases |
| Repositorio, ramas y Pull Requests | Azure Repos | GitHub (fuente de verdad), copiado a GitLab en cada push | GitHub → Pull requests |
| Workflow complementario de GitHub Actions | — | `validacion-pr.yml` (lint, pruebas, build, dependency review) y `sincronizar-gitlab.yml` (espejo + check del pipeline) | GitHub → Actions |

## Por qué así

- **Un solo repositorio**: GitHub es la fuente de verdad. GitHub Actions empuja cada rama y tag a GitLab (`sincronizar-gitlab.yml`), así ambos sitios tienen el mismo historial y GitLab enlaza los commits con sus work items.
- **El pipeline principal manda**: el job *Pipeline de GitLab* espera el resultado del pipeline de GitLab y lo publica como check del PR. Un PR no se puede fusionar si el pipeline principal falla.
- **Planes**: GitLab Free no incluye Epics ni aprobación de despliegues. El grupo usa la prueba de GitLab Ultimate (30 días). Sin ella, el backlog se carga con `--sin-epics` (Epics y Features como issues relacionados) y producción queda protegida por el job manual en un tag protegido.

## Cuentas del equipo

| Integrante | Rol | GitHub | GitLab | Permisos |
|---|---|---|---|---|
| Integrante 1 | Backend · Tech Lead | colaborador | Maintainer | Revisa PRs; **aprueba despliegues a producción** |
| Integrante 2 | Frontend | colaborador | Developer | Revisa PRs |
| Integrante 3 | DevOps · QA | dueño del repositorio | Owner del grupo | Configura runner, variables, ambientes y protecciones |
