# Base de datos

PostgreSQL 16. El esquema se versiona con migraciones SQL numeradas.

| Archivo | Contenido |
|---|---|
| `migrations/001_esquema_inicial.sql` | Tablas `usuarios`, `categorias`, `incidentes`, `bitacora` y categorías base |
| `migrations/002_indices_filtros.sql` | Índices de filtros y llaves foráneas (TD-01) |
| `pruebas/td-01-explain.sql` | Carga sintética y `EXPLAIN ANALYZE` para evidenciar TD-01 (solo en una base de pruebas) |

## Uso

```bash
cd backend
npm run db:migrate     # aplica las migraciones pendientes y las registra en schema_migrations
npm run seed           # crea el administrador (SEED_ADMIN_PASSWORD)
npm run seed:demo      # además técnicos, usuarios e incidentes de demostración (SEED_DEMO_PASSWORD)
```

## Reglas

- Nunca modificar una migración ya aplicada: crear una nueva (`003_...sql`).
- Migraciones solo hacia adelante y compatibles con la versión anterior de la aplicación (permite rollback sin tocar la base).
- Sin datos sensibles ni contraseñas en los archivos SQL.

Diagrama entidad-relación en [docs/arquitectura.md](../docs/arquitectura.md#modelo-de-datos).
