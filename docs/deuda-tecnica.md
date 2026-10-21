# Deuda técnica

Registro de deuda técnica real identificada durante el proyecto. Cada elemento existe como **User Story con etiqueta `deuda-tecnica`** en GitLab (Feature *Gestión de deuda técnica*); las resueltas se trabajaron con el mismo flujo (rama `fix/*`, commits `GL-<n>`, PR, pipeline).

Clasificación: **Impacto** (alto/medio/bajo sobre usuarios u operación) y **Esfuerzo** (horas estimadas).

| ID | Deuda | Tipo | Impacto | Esfuerzo | Estado |
|---|---|---|---|---|---|
| TD-01 | Columnas de filtro y llaves foráneas sin índices | Rendimiento / BD | Medio | 1 h | ✅ Resuelta en v0.3.1 |
| TD-02 | El login no limita intentos fallidos | Seguridad | Alto | 2 h | ✅ Resuelta en v0.3.2 |
| TD-03 | Token JWT guardado en `localStorage` | Seguridad | Medio | 6 h | Identificada |
| TD-04 | Sin pruebas end-to-end del frontend | Calidad | Medio | 8 h | Identificada |
| TD-05 | Desactivar un usuario no revoca su sesión vigente | Seguridad | Medio | 4 h | Identificada |
| TD-06 | Categorías solo administrables por migración | Funcional | Bajo | 4 h | Identificada |
| TD-07 | Dashboard sin rango de fechas ni caché | Rendimiento / Funcional | Bajo | 5 h | Identificada |

## Resueltas

### TD-01 · Índices faltantes en columnas de filtro

- **Hallazgo**: PostgreSQL no crea índices automáticos para llaves foráneas. El listado filtra por `estado`, `prioridad`, `categoria_id`, `tecnico_id`, `reportado_por` y ordena por `creado_en`; con volumen real cada consulta haría un recorrido secuencial de `incidentes`. La bitácora se consulta siempre por `incidente_id`.
- **Solución**: migración `database/migrations/002_indices_filtros.sql` con siete índices.
- **Trazabilidad**: rama `fix/td-01-indices-filtros` → PR → versión **v0.3.1**.
- **Evidencia** (`database/pruebas/td-01-explain.sql`, 50 000 incidentes sintéticos en una base de pruebas):

  | | Plan | Tiempo de ejecución |
  |---|---|---|
  | Antes (solo 001) | `Seq Scan on incidentes` (recorre 50 000 filas) | 4.525 ms |
  | Después (001 + 002) | `Index Scan using idx_incidentes_creado_en` (revisa 500 filas y devuelve 10) | 0.087 ms |

  Con pocos registros PostgreSQL elige `Seq Scan` aunque existan índices; por eso la medición se hace con carga sintética. Los tiempos varían según el equipo: registra los de tu ejecución.

### TD-02 · Login sin límite de intentos

- **Hallazgo**: `POST /api/auth/login` aceptaba intentos ilimitados, lo que permitía fuerza bruta sobre contraseñas.
- **Solución**: middleware `backend/src/middleware/rateLimiter.js` (express-rate-limit): 5 intentos fallidos por IP cada 15 minutos (`LOGIN_MAX_INTENTOS`), los logins exitosos no consumen cupo, respuesta `429` con mensaje claro.
- **Prueba**: `tests/backend/integration/limite-login.test.js`.
- **Trazabilidad**: rama `fix/td-02-limite-intentos-login` → PR → versión **v0.3.2**.

## Identificadas (pendientes)

### TD-03 · Token en `localStorage`
Un script inyectado (XSS) podría leer el token. Mitigación actual: React escapa el contenido, no se usa `dangerouslySetInnerHTML`, helmet aplica CSP. **Propuesta**: cookie `HttpOnly; Secure; SameSite=Strict` + protección CSRF.

### TD-04 · Sin pruebas end-to-end
Las pruebas del frontend cubren utilidades, no flujos completos en el navegador. **Propuesta**: Playwright con los flujos login → reportar → asignar → resolver → cerrar, ejecutado contra staging.

### TD-05 · Sesión vigente tras desactivar usuario
El JWT sigue siendo válido hasta expirar (8 h). **Propuesta**: verificar `activo` en el middleware (con caché corta) o tokens de corta duración + refresh token.

### TD-06 · Categorías sin administración
Agregar una categoría requiere una migración. **Propuesta**: CRUD de categorías para ADMIN con desactivación lógica.

### TD-07 · Dashboard sin filtros de periodo
Los indicadores se calculan sobre todo el histórico en cada petición. **Propuesta**: filtro por rango de fechas y caché de 60 s o vista materializada.

## Política

- Toda deuda nueva se registra en GitLab con la plantilla *Deuda tecnica* (etiqueta `deuda-tecnica`, impacto y esfuerzo como weight).
- Las deudas de **seguridad con impacto alto** se resuelven antes del siguiente release.
- Se reserva ~15 % de cada semana para deuda técnica.
