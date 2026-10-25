# IT Incident Hub

Sistema web para que el departamento de TI registre, asigne, atienda y cierre incidentes con trazabilidad completa, en lugar de recibirlos dispersos por llamadas, mensajería y correo.

Proyecto integrador del curso **Análisis de Sistemas** — flujo DevOps verificable desde la necesidad del negocio hasta un release controlado.

[![pipeline](https://gitlab.com/incident-hub-lmf/incident-hub/badges/main/pipeline.svg)](https://gitlab.com/incident-hub-lmf/incident-hub/-/pipelines)
[![coverage](https://gitlab.com/incident-hub-lmf/incident-hub/badges/main/coverage.svg)](https://gitlab.com/incident-hub-lmf/incident-hub/-/pipelines)
[![Validación de PR](https://github.com/lmartinezf-spec/incident-hub/actions/workflows/validacion-pr.yml/badge.svg)](https://github.com/lmartinezf-spec/incident-hub/actions/workflows/validacion-pr.yml)

| | Enlace |
|---|---|
| Código y Pull Requests | `https://github.com/lmartinezf-spec/incident-hub` |
| Backlog, tablero, pipelines, ambientes y releases | `https://gitlab.com/incident-hub-lmf/incident-hub` |

## Funcionalidades

| Área | Qué incluye |
|---|---|
| Incidentes | Registro con título, descripción, categoría, prioridad, usuario, fecha y estado |
| Operación | Asignación y reasignación de técnico; flujo `NUEVO → ASIGNADO → EN_PROCESO → RESUELTO → CERRADO` (con reapertura) |
| Seguimiento | Bitácora por incidente: creación, asignaciones, cambios de estado y comentarios |
| Consulta | Filtros por estado, prioridad, categoría, técnico y texto; paginación |
| Indicadores | Dashboard: abiertos, críticos, sin asignar, resueltos, cerrados, tiempo promedio de resolución y distribución por estado, prioridad, categoría y técnico |
| Acceso | Login JWT con roles **ADMIN**, **TECNICO** y **USUARIO**; administración de usuarios |

## Tecnologías

React 19 + Vite 8 · Node.js 22 + Express 5 · PostgreSQL 16+ · Jest, Vitest · GitHub (repositorio, PRs, Actions) · GitLab (backlog, CI/CD con runner autohospedado, ambientes, releases) · PM2.

## Estructura

```
incident-hub/
├── backend/               API REST (MVC)
├── frontend/              SPA React
├── database/              migraciones SQL y pruebas de base de datos
├── tests/                 pruebas automatizadas (backend y frontend)
├── devops/                scripts del pipeline, despliegue y release
├── docs/                  arquitectura, branching, deuda técnica, seguridad, dependencias, release
├── .github/workflows/     GitHub Actions (validación de PR y espejo a GitLab)
├── .gitlab/               plantillas de issues de GitLab
├── .gitlab-ci.yml         pipeline principal (GitLab CI/CD)
└── CHANGELOG.md           historial de versiones
```

## Requisitos

- Node.js 22 LTS y npm 10+
- PostgreSQL 16+
- Git

## Instalación y ejecución local

```bash
# 1. Clonar
git clone https://github.com/lmartinezf-spec/incident-hub.git
cd incident-hub

# 2. Base de datos (en psql o pgAdmin como postgres)
#    CREATE DATABASE incident_hub;

# 3. Backend
cd backend
cp .env.example .env          # en Windows: copy .env.example .env
#    Completa DB_PASSWORD, JWT_SECRET, SEED_ADMIN_PASSWORD y SEED_DEMO_PASSWORD
npm install
npm run db:migrate            # crea las tablas
npm run seed:demo             # admin + técnicos, usuarios e incidentes de ejemplo
npm run dev                   # API en http://localhost:4000

# 4. Frontend (otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Para generar un `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Cuentas de demostración

`npm run seed:demo` crea estas cuentas. Las contraseñas **no están en el repositorio**: son las que definiste en `SEED_ADMIN_PASSWORD` (admin) y `SEED_DEMO_PASSWORD` (resto) dentro de tu `.env`.

| Rol | Correo |
|---|---|
| ADMIN | `admin@incidenthub.local` (o `SEED_ADMIN_EMAIL`) |
| TECNICO | `tecnico1@incidenthub.local`, `tecnico2@incidenthub.local` |
| USUARIO | `usuario1@incidenthub.local`, `usuario2@incidenthub.local` |

## Pruebas y calidad

```bash
cd backend  && npm run lint && npm test          # Jest: unitarias + integración (supertest)
cd frontend && npm run lint && npm test          # Vitest
node devops/scripts/auditoria.js --dir backend   # análisis de dependencias
```

Las pruebas viven en `tests/backend` y `tests/frontend`. El backend usa mocks de los modelos, por lo que las pruebas no necesitan base de datos.

## CI/CD

| Evento en GitHub | GitLab CI/CD (pipeline principal, runner propio) | GitHub Actions |
|---|---|---|
| Push a una rama | Versión, pruebas, dependencias y build; su resultado es el check **Pipeline de GitLab** del PR | Espejo a GitLab |
| Pull Request a `main` | — | Lint, pruebas, build y revisión de dependencias |
| Merge en `main` | Lo anterior + paquete + despliegue a **Staging** | Espejo a GitLab |
| Tag `vX.Y.Z` | Lo anterior + **Producción** (aprobación y ejecución manual) + Release | Espejo a GitLab |

Detalle en [docs/pipelines.md](docs/pipelines.md), [docs/estrategia-release.md](docs/estrategia-release.md) y [docs/runner-autohospedado.md](docs/runner-autohospedado.md).

## Documentación

| Documento | Contenido |
|---|---|
| [Herramientas](docs/herramientas.md) | Qué hace GitHub, qué hace GitLab y su equivalencia con el enunciado |
| [Arquitectura](docs/arquitectura.md) | Componentes, modelo de datos, estados, API |
| [Branching](docs/branching.md) | Ramas, commits `GL-<n>`, PRs y protección de `main` |
| [Deuda técnica](docs/deuda-tecnica.md) | 7 deudas identificadas, 2 resueltas |
| [Seguridad](docs/seguridad.md) | Secretos y controles |
| [Dependencias](docs/dependencias.md) | Vulnerabilidades, severidad y decisiones |
| [Estrategia de release](docs/estrategia-release.md) | Ambientes, aprobaciones, SemVer, rollback |
| [Pipelines](docs/pipelines.md) | GitLab CI/CD, GitHub Actions, fallo controlado |
| [Runner autohospedado](docs/runner-autohospedado.md) | Instalación y operación |
| [Evidencias](docs/evidencias.md) | Índice de enlaces para la revisión |

## Equipo

| Integrante | Rol | Responsabilidades | GitHub | GitLab |
|---|---|---|---|---|
| Integrante 1 | Backend · Tech Lead | API, base de datos, seguridad de la aplicación, aprobación de producción | `@luismart005` | `@AlbertoMUMG` |
| Integrante 2 | Frontend | Interfaz React, dashboard, pruebas de frontend | `@luisalbertomafra-lang` | `@LuisFUMG` |
| Integrante 3 | DevOps · QA | Pipelines, runner, espejo, pruebas, release | `@lmartinezf-spec` | `@LuisUMG` |

## Versión

La versión actual se muestra en la barra lateral de la aplicación y en `GET /api/health`. Historial en [CHANGELOG.md](CHANGELOG.md).
