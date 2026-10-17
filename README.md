# IT Incident Hub

Sistema web para registrar, asignar, atender y cerrar incidentes del departamento de TI con trazabilidad completa.

Proyecto integrador del curso Análisis de Sistemas.

## Estado

En desarrollo. El plan de trabajo está en GitLab (Epics, issues y tablero) y la estrategia de ramas en `docs/branching.md`.

## Estructura prevista

- `backend/` API REST (Node.js + Express + PostgreSQL)
- `frontend/` SPA (React + Vite)
- `database/` migraciones SQL
- `tests/` pruebas automatizadas
- `devops/` scripts del pipeline y despliegue
- `docs/` documentación
- `.github/workflows/` GitHub Actions
- `.gitlab-ci.yml` pipeline principal en GitLab CI/CD