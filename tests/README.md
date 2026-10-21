# Pruebas automatizadas

| Carpeta | Herramienta | Se ejecuta con |
|---|---|---|
| `backend/unit` | Jest | `cd backend && npm test` |
| `backend/integration` | Jest + supertest (modelos simulados, sin base de datos) | `cd backend && npm test` |
| `frontend` | Vitest | `cd frontend && npm test` |

- `npm run test:ci` genera reportes JUnit en `backend/reports` y `frontend/reports`, y cobertura en `backend/coverage` (umbral mínimo: 70 % de líneas).
- Las pruebas del backend necesitan `JWT_SECRET`: localmente se toma de `backend/.env`; en GitLab CI se mapea desde la variable `JWT_SECRET_TEST` y en GitHub Actions desde el secreto del mismo nombre.

| Suite | Qué valida |
|---|---|
| `unit/estados.test.js` | Transiciones, permisos por rol y acciones disponibles |
| `unit/validar.test.js` | Validación y normalización de entradas |
| `unit/filtros.test.js` | SQL parametrizado de filtros y visibilidad por rol |
| `unit/auth.middleware.test.js` | Firma y verificación de JWT, autorización |
| `integration/auth.test.js` | Login y perfil |
| `integration/incidentes.test.js` | CRUD, asignación, estados, bitácora, comentarios, concurrencia |
| `integration/usuarios.test.js` | Administración de usuarios |
| `integration/sistema.test.js` | Health, dashboard, catálogos, cabeceras de seguridad, manejo de errores |
| `integration/limite-login.test.js` | Límite de intentos de login (TD-02) |
| `frontend/formato.test.js` | Utilidades de formato y reglas de la interfaz |
