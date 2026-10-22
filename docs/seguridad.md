# Seguridad

## Manejo de secretos

**Regla**: ninguna credencial, token o clave se guarda en el repositorio, en capturas ni en la documentación.

### GitLab (Settings → CI/CD → Variables)

| Variable | Ámbito (environment scope) | Protegida | Enmascarada | Uso |
|---|---|---|---|---|
| `JWT_SECRET_TEST` | `*` (todos) | No | Sí | Pruebas del backend en cualquier rama |
| `JWT_SECRET` | `staging` | Sí | Sí | Firma de tokens en staging |
| `JWT_SECRET` | `production` | Sí | Sí | Firma de tokens en producción (valor distinto) |
| `DB_USER` | `*` (todos) | No | No | `incident_app`: usuario de PostgreSQL de los ambientes (no es superusuario) |
| `DB_PASSWORD` | `staging` y `production` | Sí | Sí | Contraseña de `incident_app` |
| `SEED_ADMIN_PASSWORD` | `staging` y `production` | Sí | Sí | Administrador inicial |
| `SEED_DEMO_PASSWORD` | `staging` | Sí | Sí | Usuarios de demostración |
| `SEED_DEMO` | `staging` | No | No | `true` |
| `DB_NAME` *(opcional)* | `staging` / `production` | No | No | Por defecto `incident_hub_<ambiente>` |
| `CORS_ORIGIN` *(opcional)* | `staging` / `production` | No | No | Por defecto `http://localhost:<puerto>` |

- **Ámbito por ambiente**: `JWT_SECRET`, `DB_PASSWORD` y los `SEED_*` solo llegan a los jobs `deploy-staging` o `deploy-produccion`. El job de pruebas no los ve; usa `JWT_SECRET_TEST`, mapeado de forma explícita en `.gitlab-ci.yml`.
- **Protegidas**: solo llegan a pipelines de ramas o tags protegidos (`main` y `v*`). Una rama de trabajo nunca recibe secretos de los ambientes.
- **Enmascaradas**: GitLab reemplaza su valor por `[MASKED]` en los logs. Requisito: 8+ caracteres, sin espacios. Usa valores hexadecimales o alfanuméricos.

### GitHub (Settings → Secrets and variables → Actions)

| Nombre | Tipo | Uso |
|---|---|---|
| `JWT_SECRET_TEST` | Secreto | Pruebas en `validacion-pr.yml` |
| `GITLAB_TOKEN` | Secreto | Token personal de GitLab del Integrante 3 (`write_repository`, `read_api`) para el espejo y para leer el pipeline |
| `GITLAB_PROYECTO` | Variable | Ruta del proyecto en GitLab (no es secreta) |

### Local

`backend/.env` (en `.gitignore`), a partir de `backend/.env.example`.

### Cómo se aplica

- `.gitignore` excluye `.env` y `.env.*` (excepto `.env.example`).
- Los secretos de GitHub no llegan a workflows de forks y solo se mapean con `env:` en los pasos que los usan.
- El script de despliegue genera el `.env` de cada ambiente en el servidor a partir de las variables de GitLab; ese archivo nunca pasa por el repositorio.
- Las contraseñas iniciales se leen de variables (`SEED_*`): no hay credenciales en el código ni en migraciones.
- La configuración falla rápido si falta `JWT_SECRET` y en producción exige 32+ caracteres y `DB_PASSWORD`.
- El job `release` usa `CI_JOB_TOKEN` (temporal, generado por GitLab en cada job): no se necesita ningún token personal para publicar.
- El token del espejo (`GITLAB_TOKEN`) tiene fecha de expiración y solo los alcances necesarios.

### Si un secreto se filtra

1. Rotarlo de inmediato (nuevo valor en GitLab o GitHub; para JWT invalida todas las sesiones).
2. Si llegó a un commit, considerarlo comprometido aunque se borre: reescribir el historial no basta porque ya fue clonado y copiado a GitLab.
3. Registrar un issue con la plantilla *Bug*, la causa y la corrección.

## Controles en la aplicación

| Riesgo | Control | Ubicación |
|---|---|---|
| Contraseñas expuestas | Hash bcrypt (10 rondas), nunca se devuelve `password_hash` | `controllers/auth.controller.js`, `models/usuario.model.js` |
| Fuerza bruta en login | 5 intentos fallidos / 15 min por IP → `429` | `middleware/rateLimiter.js` (TD-02) |
| Enumeración de usuarios | Mismo mensaje y tiempo de respuesta para correo inexistente, contraseña errónea o cuenta inactiva | `auth.controller.js` (hash de relleno) |
| Acceso no autorizado | JWT firmado (HS256, expira en 8 h) + autorización por rol en cada ruta | `middleware/auth.js`, `routes/*` |
| Acceso a datos ajenos | Visibilidad por rol en consultas y en el detalle (`403`) | `utils/filtros.js`, `utils/estados.js` |
| Inyección SQL | Consultas 100 % parametrizadas (`$1, $2…`) | `models/*` |
| Datos inválidos | Validación de tipos, longitudes y listas permitidas antes del controlador | `middleware/validar.js`, `validators/*` |
| Cabeceras inseguras | helmet (CSP, `X-Content-Type-Options`, sin `X-Powered-By`, etc.) | `app.js` |
| Cuerpos enormes | `express.json({ limit: '100kb' })` | `app.js` |
| CORS abierto | Solo orígenes de `CORS_ORIGIN` | `app.js` |
| Filtrado de errores internos | En producción los 500 devuelven mensaje genérico | `middleware/errorHandler.js` |
| Condiciones de carrera | Actualización optimista con estado esperado → `409` | `models/incidente.model.js` |

Riesgos aceptados y pendientes: ver TD-03 y TD-05 en [deuda-tecnica.md](deuda-tecnica.md).

## Controles en el proceso

- `main` protegida en GitHub (PR, revisión de otro integrante, checks en verde) y en GitLab (solo maintainers, sin force push).
- El runner autohospedado solo ejecuta pipelines de este proyecto (project runner con tag `incident-hub`) y GitLab no los dispara desde forks: el proyecto no recibe merge requests.
- Revisión de dependencias en cada pipeline de GitLab y *dependency review* en cada PR de GitHub. Ver [dependencias.md](dependencias.md).
- Producción solo se despliega desde tags `vX.Y.Z` protegidos, con ejecución manual y aprobación del Integrante 1 en el ambiente protegido `production`.
- El paquete se instala con `npm ci --omit=dev`: las dependencias de desarrollo no llegan a los servidores.
- La plantilla de PR incluye la verificación "sin secretos".
