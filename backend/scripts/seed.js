/**
 * Crea el usuario administrador inicial y, con --demo, usuarios e incidentes de demostración.
 * Las contraseñas se leen de variables de entorno: nunca se escriben en el repositorio.
 *
 *   npm run seed        -> requiere SEED_ADMIN_PASSWORD
 *   npm run seed:demo   -> además requiere SEED_DEMO_PASSWORD
 *
 * Es idempotente: se puede ejecutar varias veces sin duplicar datos.
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const DEMO = process.argv.includes('--demo');

const USUARIOS_DEMO = [
  { clave: 'tecnico1', nombre: 'Carlos Pérez', email: 'tecnico1@incidenthub.local', rol: 'TECNICO' },
  { clave: 'tecnico2', nombre: 'Ana López', email: 'tecnico2@incidenthub.local', rol: 'TECNICO' },
  { clave: 'usuario1', nombre: 'María García', email: 'usuario1@incidenthub.local', rol: 'USUARIO' },
  { clave: 'usuario2', nombre: 'Jorge Ramírez', email: 'usuario2@incidenthub.local', rol: 'USUARIO' }
];

const INCIDENTES_DEMO = [
  ['Caída de red en el segundo nivel', 'Ningún equipo del segundo nivel tiene conexión a la red interna ni a internet desde las 8:00.', 'Redes', 'CRITICA', 'usuario2', 'tecnico1', 'EN_PROCESO', 5],
  ['Servidor de archivos sin espacio disponible', 'Al guardar documentos en la unidad compartida aparece el mensaje "disco lleno".', 'Hardware', 'CRITICA', 'usuario1', 'tecnico2', 'ASIGNADO', 3],
  ['Antivirus desactualizado en equipos de bodega', 'La consola de antivirus reporta 12 equipos de bodega sin firmas actualizadas desde hace un mes.', 'Seguridad', 'CRITICA', 'usuario2', 'tecnico2', 'EN_PROCESO', 10],
  ['Correo sospechoso solicitando credenciales', 'Recibí un correo que dice ser de TI y pide confirmar mi usuario y contraseña en un enlace externo.', 'Seguridad', 'ALTA', 'usuario1', null, 'NUEVO', 1],
  ['Lentitud en el sistema de facturación', 'Emitir una factura tarda más de dos minutos; ayer tardaba segundos.', 'Software', 'ALTA', 'usuario1', 'tecnico1', 'EN_PROCESO', 20],
  ['Sin acceso a la VPN desde casa', 'El cliente VPN muestra error de autenticación aunque la contraseña es correcta.', 'Redes', 'ALTA', 'usuario2', 'tecnico2', 'CERRADO', 72],
  ['Usuario bloqueado en el ERP', 'Después de tres intentos el ERP bloqueó mi usuario y no puedo registrar pedidos.', 'Accesos y cuentas', 'ALTA', 'usuario2', 'tecnico1', 'CERRADO', 48],
  ['No enciende la impresora de contabilidad', 'La impresora láser del área de contabilidad no enciende; el cable de poder está conectado.', 'Hardware', 'MEDIA', 'usuario1', 'tecnico1', 'RESUELTO', 30],
  ['Solicitud de acceso a carpeta de Recursos Humanos', 'Necesito permisos de lectura en la carpeta compartida de RR. HH. por traslado de puesto.', 'Accesos y cuentas', 'MEDIA', 'usuario1', 'tecnico2', 'CERRADO', 120],
  ['Error al exportar reportes a Excel', 'El módulo de reportes genera un archivo vacío al exportar a Excel.', 'Software', 'MEDIA', 'usuario2', 'tecnico2', 'RESUELTO', 26],
  ['Wi-Fi intermitente en sala de reuniones', 'La conexión inalámbrica se cae cada pocos minutos durante las videollamadas.', 'Redes', 'MEDIA', 'usuario2', 'tecnico2', 'ASIGNADO', 8],
  ['Monitor parpadea constantemente', 'El monitor del puesto 14 parpadea y por momentos se queda en negro.', 'Hardware', 'BAJA', 'usuario1', 'tecnico1', 'CERRADO', 200],
  ['El correo no sincroniza en el celular', 'La aplicación de correo del teléfono corporativo dejó de recibir mensajes nuevos.', 'Correo electrónico', 'BAJA', 'usuario2', null, 'NUEVO', 2],
  ['Instalación de software de diseño', 'Solicito la instalación del software de diseño autorizado para el área de mercadeo.', 'Software', 'BAJA', 'usuario1', null, 'NUEVO', 0.5]
];

const ORDEN = ['NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO'];

function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    console.error(`[seed] Define la variable ${nombre} (en backend/.env o en el pipeline).`);
    process.exit(1);
  }
  return valor;
}

async function upsertUsuario(cliente, { nombre, email, rol }, passwordHash) {
  await cliente.query(
    `INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [nombre, email, passwordHash, rol]
  );
  const { rows } = await cliente.query('SELECT id FROM usuarios WHERE email = $1', [email]);
  return rows[0].id;
}

async function crearIncidenteDemo(cliente, datos, ids, categorias) {
  const [titulo, descripcion, categoria, prioridad, reporta, tecnico, estadoFinal, horasAtras] = datos;
  const hora = (horas) => new Date(Date.now() - (horasAtras - horas) * 3600 * 1000);
  const nivel = ORDEN.indexOf(estadoFinal);
  const eventos = [];

  eventos.push([ids[reporta], 'CREACION', 'Incidente registrado', null, 'NUEVO', hora(0)]);
  if (nivel >= 1) {
    eventos.push([ids.admin, 'ASIGNACION', `Asignado a ${ids.nombres[tecnico]}`, 'NUEVO', 'ASIGNADO', hora(0.25)]);
  }
  if (nivel >= 2) {
    eventos.push([ids[tecnico], 'CAMBIO_ESTADO', 'Estado: ASIGNADO → EN_PROCESO', 'ASIGNADO', 'EN_PROCESO', hora(0.5)]);
    eventos.push([ids[tecnico], 'COMENTARIO', 'Revisando el caso, en breve doy seguimiento.', null, null, hora(0.6)]);
  }
  if (nivel >= 3) {
    eventos.push([ids[tecnico], 'CAMBIO_ESTADO', 'Estado: EN_PROCESO → RESUELTO. Se aplicó la corrección y se validó con el usuario.', 'EN_PROCESO', 'RESUELTO', hora(Math.min(horasAtras - 2, 6))]);
  }
  if (nivel >= 4) {
    eventos.push([ids[reporta], 'CAMBIO_ESTADO', 'Estado: RESUELTO → CERRADO. Confirmo que funciona correctamente.', 'RESUELTO', 'CERRADO', hora(Math.min(horasAtras - 1, 8))]);
  }

  const resuelto = eventos.find((e) => e[4] === 'RESUELTO');
  const cerrado = eventos.find((e) => e[4] === 'CERRADO');
  const ultimo = eventos[eventos.length - 1];

  const { rows } = await cliente.query(
    `INSERT INTO incidentes (titulo, descripcion, categoria_id, prioridad, estado, reportado_por,
                             tecnico_id, creado_en, actualizado_en, resuelto_en, cerrado_en)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      titulo,
      descripcion,
      categorias[categoria],
      prioridad,
      estadoFinal,
      ids[reporta],
      tecnico ? ids[tecnico] : null,
      hora(0),
      ultimo[5],
      resuelto ? resuelto[5] : null,
      cerrado ? cerrado[5] : null
    ]
  );

  for (const [usuarioId, tipo, detalle, anterior, nuevo, fecha] of eventos) {
    await cliente.query(
      `INSERT INTO bitacora (incidente_id, usuario_id, tipo, detalle, estado_anterior, estado_nuevo, creado_en)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [rows[0].id, usuarioId, tipo, detalle, anterior, nuevo, fecha]
    );
  }
}

async function main() {
  const adminPassword = requerida('SEED_ADMIN_PASSWORD');
  const demoPassword = DEMO ? requerida('SEED_DEMO_PASSWORD') : null;
  const admin = {
    nombre: process.env.SEED_ADMIN_NOMBRE || 'Administrador TI',
    email: (process.env.SEED_ADMIN_EMAIL || 'admin@incidenthub.local').toLowerCase(),
    rol: 'ADMIN'
  };

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const ids = { nombres: {} };
    ids.admin = await upsertUsuario(cliente, admin, await bcrypt.hash(adminPassword, 10));
    console.log(`[seed] administrador listo: ${admin.email}`);

    if (DEMO) {
      const hashDemo = await bcrypt.hash(demoPassword, 10);
      for (const usuario of USUARIOS_DEMO) {
        ids[usuario.clave] = await upsertUsuario(cliente, usuario, hashDemo);
        ids.nombres[usuario.clave] = usuario.nombre;
      }
      console.log(`[seed] ${USUARIOS_DEMO.length} usuarios de demostración listos`);

      const { rows } = await cliente.query('SELECT COUNT(*)::int AS total FROM incidentes');
      if (rows[0].total === 0) {
        const cat = await cliente.query('SELECT id, nombre FROM categorias');
        const categorias = Object.fromEntries(cat.rows.map((c) => [c.nombre, c.id]));
        for (const datos of INCIDENTES_DEMO) {
          await crearIncidenteDemo(cliente, datos, ids, categorias);
        }
        console.log(`[seed] ${INCIDENTES_DEMO.length} incidentes de demostración creados`);
      } else {
        console.log('[seed] ya existen incidentes, no se crean datos de demostración');
      }
    }
    await cliente.query('COMMIT');
  } catch (err) {
    await cliente.query('ROLLBACK');
    throw err;
  } finally {
    cliente.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(`[seed] ${err.message}`);
  process.exit(1);
});
