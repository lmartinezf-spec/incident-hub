# Changelog

Todos los cambios relevantes del proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [Versionado Semántico](https://semver.org/lang/es/).

## [Sin publicar]

## [0.3.2] - 2026-10-21

### Seguridad
- TD-02: límite de 5 intentos fallidos de login por IP cada 15 minutos.

## [0.3.1] - 2026-10-21

### Corregido
- TD-01: índices para las columnas de filtro y llaves foráneas de incidentes y bitácora.

## [0.3.0] - 2026-10-20

### Agregado
- Dashboard con indicadores (abiertos, críticos, sin asignar, resueltos, cerrados, tiempo promedio) y distribuciones por estado, prioridad, categoría y técnico.
- Pruebas automatizadas: Jest + supertest (backend) y Vitest (frontend).
- Pipeline principal en GitLab CI con runner autohospedado: restauración, lint, pruebas con reportes y cobertura, revisión de dependencias, build, paquete versionado y artefacto.
- Resultado del pipeline de GitLab como check de los PR de GitHub.

### Corregido
- Mapeo explícito del secreto de pruebas (`JWT_SECRET_TEST`) en el job de pruebas del backend.

## [0.2.0] - 2026-10-19

### Agregado
- Frontend React: login, listado con filtros, reporte, detalle con bitácora y acciones por rol, administración de usuarios.

## [0.1.0] - 2026-10-18

### Agregado
- Estructura del repositorio, espejo en GitLab, migraciones y scripts de datos iniciales.
- Autenticación JWT con roles ADMIN, TECNICO y USUARIO; administración de usuarios.
- API de incidentes: registro, consulta con filtros y paginación, asignación de técnico, flujo de estados, bitácora y comentarios.
