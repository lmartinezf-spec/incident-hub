-- Evidencia de TD-01: compara el plan de ejecución del listado filtrado
-- antes y después de la migración 002_indices_filtros.sql.
--
-- Uso (en una base de pruebas, NO en producción):
--   psql -d incident_hub_td01 -f database/pruebas/td-01-explain.sql
--
-- 1) Carga 50 000 incidentes sintéticos (requiere al menos un usuario y las categorías).
INSERT INTO incidentes (titulo, descripcion, categoria_id, prioridad, estado, reportado_por, tecnico_id, creado_en)
SELECT 'Incidente de carga ' || g,
       'Registro sintético para medir el plan de ejecución',
       (SELECT id FROM categorias ORDER BY id LIMIT 1 OFFSET (g % 7)),
       (ARRAY['BAJA', 'MEDIA', 'ALTA', 'CRITICA'])[1 + g % 4],
       CASE WHEN g % 50 = 0 THEN 'NUEVO' ELSE 'CERRADO' END,
       (SELECT MIN(id) FROM usuarios),
       CASE WHEN g % 50 = 0 THEN NULL ELSE (SELECT MIN(id) FROM usuarios) END,
       NOW() - (g || ' minutes')::interval
  FROM generate_series(1, 50000) AS g;
ANALYZE incidentes;

-- 2) Plan del listado "incidentes nuevos" (consulta que hace la API con ?estado=NUEVO).
EXPLAIN ANALYZE
SELECT i.id, i.titulo, i.estado
  FROM incidentes i
 WHERE i.estado = 'NUEVO'
 ORDER BY i.creado_en DESC, i.id DESC
 LIMIT 10;
