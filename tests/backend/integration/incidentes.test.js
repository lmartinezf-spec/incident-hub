jest.mock('../../../backend/src/models/incidente.model');
jest.mock('../../../backend/src/models/bitacora.model');
jest.mock('../../../backend/src/models/usuario.model');

const request = require('supertest');
const app = require('../../../backend/src/app');
const incidenteModel = require('../../../backend/src/models/incidente.model');
const bitacoraModel = require('../../../backend/src/models/bitacora.model');
const usuarioModel = require('../../../backend/src/models/usuario.model');
const { bearer, incidenteDemo, USUARIOS } = require('../helpers');

beforeEach(() => jest.resetAllMocks());

describe('GET /api/incidentes', () => {
  test('requiere autenticación', async () => {
    expect((await request(app).get('/api/incidentes')).status).toBe(401);
  });

  test('normaliza filtros y devuelve paginación', async () => {
    incidenteModel.listar.mockResolvedValue({ datos: [incidenteDemo()], total: 23 });

    const res = await request(app)
      .get('/api/incidentes?estado=nuevo&prioridad=alta&categoriaId=2&page=2&limit=10')
      .set('Authorization', bearer('admin'));

    expect(res.status).toBe(200);
    expect(res.body.paginacion).toEqual({ page: 2, limit: 10, total: 23, totalPaginas: 3 });
    const [filtros, usuario, paginacion] = incidenteModel.listar.mock.calls[0];
    expect(filtros).toEqual({ estado: 'NUEVO', prioridad: 'ALTA', categoriaId: 2 });
    expect(usuario.rol).toBe('ADMIN');
    expect(paginacion).toMatchObject({ limit: 10, offset: 10 });
  });

  test('rechaza filtros inválidos', async () => {
    const res = await request(app).get('/api/incidentes?estado=PAUSADO').set('Authorization', bearer('admin'));
    expect(res.status).toBe(400);
  });
});

describe('POST /api/incidentes', () => {
  test('crea el incidente a nombre del usuario autenticado', async () => {
    incidenteModel.crear.mockResolvedValue(incidenteDemo());
    const cuerpo = { titulo: 'Impresora sin conexión', descripcion: 'No imprime desde ayer', categoriaId: 1, prioridad: 'media' };

    const res = await request(app).post('/api/incidentes').set('Authorization', bearer('usuario')).send(cuerpo);

    expect(res.status).toBe(201);
    expect(incidenteModel.crear).toHaveBeenCalledWith({ ...cuerpo, prioridad: 'MEDIA' }, USUARIOS.usuario.id);
  });

  test('devuelve todos los errores de validación', async () => {
    const res = await request(app).post('/api/incidentes').set('Authorization', bearer('usuario')).send({ titulo: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.detalles.map((d) => d.campo)).toEqual(['titulo', 'descripcion', 'categoriaId', 'prioridad']);
  });

  test('traduce una categoría inexistente (FK) a 400', async () => {
    incidenteModel.crear.mockRejectedValue(Object.assign(new Error('fk'), { code: '23503' }));
    const res = await request(app)
      .post('/api/incidentes')
      .set('Authorization', bearer('usuario'))
      .send({ titulo: 'Equipo lento', descripcion: 'Tarda mucho en abrir', categoriaId: 99, prioridad: 'BAJA' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/incidentes/:id', () => {
  test('incluye las acciones disponibles para el usuario', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo({ estado: 'ASIGNADO', tecnico_id: USUARIOS.tecnico.id }));
    const res = await request(app).get('/api/incidentes/10').set('Authorization', bearer('tecnico'));
    expect(res.status).toBe(200);
    expect(res.body.acciones).toEqual({ asignar: false, comentar: true, estados: ['EN_PROCESO'] });
  });

  test('404 si no existe y 403 si no es visible', async () => {
    incidenteModel.obtenerPorId.mockResolvedValueOnce(null);
    expect((await request(app).get('/api/incidentes/99').set('Authorization', bearer('admin'))).status).toBe(404);

    incidenteModel.obtenerPorId.mockResolvedValueOnce(incidenteDemo({ reportado_por: 50 }));
    expect((await request(app).get('/api/incidentes/10').set('Authorization', bearer('usuario'))).status).toBe(403);
  });

  test('valida que el id sea numérico', async () => {
    expect((await request(app).get('/api/incidentes/abc').set('Authorization', bearer('admin'))).status).toBe(400);
  });
});

describe('PATCH /api/incidentes/:id/asignar', () => {
  const tecnicoActivo = { ...USUARIOS.tecnico, activo: true };

  test('solo ADMIN puede asignar', async () => {
    const res = await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('tecnico')).send({ tecnicoId: 2 });
    expect(res.status).toBe(403);
  });

  test('asigna un incidente NUEVO y lo pasa a ASIGNADO', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo());
    usuarioModel.obtenerPorId.mockResolvedValue(tecnicoActivo);
    incidenteModel.asignarTecnico.mockResolvedValue(incidenteDemo({ estado: 'ASIGNADO', tecnico_id: 2 }));

    const res = await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('admin')).send({ tecnicoId: 2 });

    expect(res.status).toBe(200);
    expect(incidenteModel.asignarTecnico).toHaveBeenCalledWith(
      expect.objectContaining({ estadoActual: 'NUEVO', estadoNuevo: 'ASIGNADO', tecnicoId: 2, detalle: 'Asignado a Carlos Pérez' })
    );
  });

  test('una reasignación conserva el estado y lo registra', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(
      incidenteDemo({ estado: 'EN_PROCESO', tecnico_id: 3, tecnico_nombre: 'Ana López' })
    );
    usuarioModel.obtenerPorId.mockResolvedValue(tecnicoActivo);
    incidenteModel.asignarTecnico.mockResolvedValue(incidenteDemo({ estado: 'EN_PROCESO', tecnico_id: 2 }));

    await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('admin')).send({ tecnicoId: 2 });

    expect(incidenteModel.asignarTecnico).toHaveBeenCalledWith(
      expect.objectContaining({ estadoNuevo: 'EN_PROCESO', detalle: 'Reasignado de Ana López a Carlos Pérez' })
    );
  });

  test('rechaza usuarios que no son técnicos activos', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo());
    usuarioModel.obtenerPorId.mockResolvedValue({ ...USUARIOS.usuario, activo: true });
    const res = await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('admin')).send({ tecnicoId: 4 });
    expect(res.status).toBe(400);
  });

  test('no permite asignar incidentes cerrados ni repetir técnico', async () => {
    incidenteModel.obtenerPorId.mockResolvedValueOnce(incidenteDemo({ estado: 'CERRADO', tecnico_id: 3 }));
    expect(
      (await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('admin')).send({ tecnicoId: 2 })).status
    ).toBe(409);

    incidenteModel.obtenerPorId.mockResolvedValueOnce(incidenteDemo({ estado: 'ASIGNADO', tecnico_id: 2 }));
    expect(
      (await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('admin')).send({ tecnicoId: 2 })).status
    ).toBe(409);
  });

  test('responde 409 si otro usuario modificó el incidente', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo());
    usuarioModel.obtenerPorId.mockResolvedValue(tecnicoActivo);
    incidenteModel.asignarTecnico.mockResolvedValue(null);
    const res = await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('admin')).send({ tecnicoId: 2 });
    expect(res.status).toBe(409);
  });

  test('404 si el incidente no existe', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(null);
    const res = await request(app).patch('/api/incidentes/10/asignar').set('Authorization', bearer('admin')).send({ tecnicoId: 2 });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/incidentes/:id/estado', () => {
  const asignado = () => incidenteDemo({ estado: 'ASIGNADO', tecnico_id: USUARIOS.tecnico.id });

  test('el técnico asignado inicia la atención', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(asignado());
    incidenteModel.cambiarEstado.mockResolvedValue({ ...asignado(), estado: 'EN_PROCESO' });

    const res = await request(app).patch('/api/incidentes/10/estado').set('Authorization', bearer('tecnico')).send({ estado: 'en_proceso' });

    expect(res.status).toBe(200);
    expect(res.body.acciones.estados).toEqual(['RESUELTO']);
    expect(incidenteModel.cambiarEstado).toHaveBeenCalledWith(
      expect.objectContaining({ estadoActual: 'ASIGNADO', estadoNuevo: 'EN_PROCESO', usuarioId: 2 })
    );
  });

  test('transición inválida responde 409', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(asignado());
    const res = await request(app).patch('/api/incidentes/10/estado').set('Authorization', bearer('admin')).send({ estado: 'CERRADO' });
    expect(res.status).toBe(409);
    expect(incidenteModel.cambiarEstado).not.toHaveBeenCalled();
  });

  test('resolver sin describir la solución responde 400', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo({ estado: 'EN_PROCESO', tecnico_id: 2 }));
    const res = await request(app).patch('/api/incidentes/10/estado').set('Authorization', bearer('tecnico')).send({ estado: 'RESUELTO' });
    expect(res.status).toBe(400);
  });

  test('el usuario no puede resolver (403)', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo({ estado: 'EN_PROCESO', tecnico_id: 2 }));
    const res = await request(app)
      .patch('/api/incidentes/10/estado')
      .set('Authorization', bearer('usuario'))
      .send({ estado: 'RESUELTO', comentario: 'Ya funciona' });
    expect(res.status).toBe(403);
  });

  test('responde 409 ante modificación concurrente', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo({ estado: 'RESUELTO', tecnico_id: 2 }));
    incidenteModel.cambiarEstado.mockResolvedValue(null);
    const res = await request(app).patch('/api/incidentes/10/estado').set('Authorization', bearer('usuario')).send({ estado: 'CERRADO' });
    expect(res.status).toBe(409);
  });
});

describe('bitácora y comentarios', () => {
  test('lista la bitácora de un incidente visible', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo());
    bitacoraModel.listarPorIncidente.mockResolvedValue([{ id: 1, tipo: 'CREACION' }]);
    const res = await request(app).get('/api/incidentes/10/bitacora').set('Authorization', bearer('usuario'));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  test('registra un comentario', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo());
    bitacoraModel.registrar.mockResolvedValue({ id: 5, tipo: 'COMENTARIO', detalle: 'Sigue fallando' });
    const res = await request(app)
      .post('/api/incidentes/10/comentarios')
      .set('Authorization', bearer('usuario'))
      .send({ texto: 'Sigue fallando' });
    expect(res.status).toBe(201);
    expect(bitacoraModel.registrar).toHaveBeenCalledWith(
      expect.objectContaining({ incidenteId: 10, usuarioId: 4, tipo: 'COMENTARIO', detalle: 'Sigue fallando' })
    );
  });

  test('no permite comentar incidentes cerrados', async () => {
    incidenteModel.obtenerPorId.mockResolvedValue(incidenteDemo({ estado: 'CERRADO', tecnico_id: 2 }));
    const res = await request(app).post('/api/incidentes/10/comentarios').set('Authorization', bearer('admin')).send({ texto: 'Hola' });
    expect(res.status).toBe(409);
  });
});
