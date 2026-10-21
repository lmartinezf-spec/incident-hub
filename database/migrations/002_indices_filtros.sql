-- 002_indices_filtros.sql
-- TD-01: PostgreSQL no crea índices automáticamente para llaves foráneas.
-- El listado filtra por estado, prioridad, categoría, técnico y reportante,
-- y ordena por fecha; sin índices cada consulta hacía un recorrido secuencial.

CREATE INDEX IF NOT EXISTS idx_incidentes_estado        ON incidentes (estado);
CREATE INDEX IF NOT EXISTS idx_incidentes_prioridad     ON incidentes (prioridad);
CREATE INDEX IF NOT EXISTS idx_incidentes_categoria     ON incidentes (categoria_id);
CREATE INDEX IF NOT EXISTS idx_incidentes_tecnico       ON incidentes (tecnico_id);
CREATE INDEX IF NOT EXISTS idx_incidentes_reportado_por ON incidentes (reportado_por);
CREATE INDEX IF NOT EXISTS idx_incidentes_creado_en     ON incidentes (creado_en DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_bitacora_incidente       ON bitacora (incidente_id, creado_en);
