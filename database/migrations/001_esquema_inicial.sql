-- 001_esquema_inicial.sql
-- Esquema base de IT Incident Hub: usuarios, categorías, incidentes y bitácora.

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('ADMIN', 'TECNICO', 'USUARIO')),
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id      SERIAL PRIMARY KEY,
  nombre  VARCHAR(60) NOT NULL UNIQUE,
  activa  BOOLEAN     NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS incidentes (
  id             SERIAL PRIMARY KEY,
  titulo         VARCHAR(150) NOT NULL,
  descripcion    TEXT         NOT NULL,
  categoria_id   INTEGER      NOT NULL REFERENCES categorias (id),
  prioridad      VARCHAR(10)  NOT NULL CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
  estado         VARCHAR(15)  NOT NULL DEFAULT 'NUEVO'
                 CHECK (estado IN ('NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
  reportado_por  INTEGER      NOT NULL REFERENCES usuarios (id),
  tecnico_id     INTEGER      REFERENCES usuarios (id),
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  resuelto_en    TIMESTAMPTZ,
  cerrado_en     TIMESTAMPTZ,
  CONSTRAINT chk_asignacion CHECK (estado = 'NUEVO' OR tecnico_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS bitacora (
  id              SERIAL PRIMARY KEY,
  incidente_id    INTEGER     NOT NULL REFERENCES incidentes (id) ON DELETE CASCADE,
  usuario_id      INTEGER     NOT NULL REFERENCES usuarios (id),
  tipo            VARCHAR(20) NOT NULL
                  CHECK (tipo IN ('CREACION', 'COMENTARIO', 'ASIGNACION', 'CAMBIO_ESTADO')),
  detalle         TEXT        NOT NULL,
  estado_anterior VARCHAR(15),
  estado_nuevo    VARCHAR(15),
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categorias (nombre) VALUES
  ('Hardware'),
  ('Software'),
  ('Redes'),
  ('Accesos y cuentas'),
  ('Correo electrónico'),
  ('Seguridad'),
  ('Otro')
ON CONFLICT (nombre) DO NOTHING;
