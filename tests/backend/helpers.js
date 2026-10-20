const { firmarToken } = require('../../backend/src/middleware/auth');

const USUARIOS = {
  admin: { id: 1, nombre: 'Admin TI', email: 'admin@empresa.com', rol: 'ADMIN' },
  tecnico: { id: 2, nombre: 'Carlos Pérez', email: 'tecnico@empresa.com', rol: 'TECNICO' },
  usuario: { id: 4, nombre: 'María García', email: 'maria@empresa.com', rol: 'USUARIO' }
};

function bearer(clave) {
  return `Bearer ${firmarToken(USUARIOS[clave])}`;
}

function incidenteDemo(extra = {}) {
  return {
    id: 10,
    titulo: 'Impresora sin conexión',
    descripcion: 'La impresora del segundo nivel no responde',
    prioridad: 'MEDIA',
    estado: 'NUEVO',
    categoria_id: 1,
    categoria: 'Hardware',
    reportado_por: USUARIOS.usuario.id,
    reportado_por_nombre: USUARIOS.usuario.nombre,
    tecnico_id: null,
    tecnico_nombre: null,
    creado_en: '2026-10-01T10:00:00.000Z',
    actualizado_en: '2026-10-01T10:00:00.000Z',
    resuelto_en: null,
    cerrado_en: null,
    ...extra
  };
}

module.exports = { USUARIOS, bearer, incidenteDemo };
