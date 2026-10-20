jest.mock('../../../backend/src/models/usuario.model');

const request = require('supertest');
const app = require('../../../backend/src/app');
const usuarioModel = require('../../../backend/src/models/usuario.model');
const { bearer } = require('../helpers');

beforeEach(() => jest.resetAllMocks());

describe('/api/usuarios', () => {
  test('solo ADMIN lista usuarios', async () => {
    usuarioModel.listar.mockResolvedValue([]);
    expect((await request(app).get('/api/usuarios').set('Authorization', bearer('tecnico'))).status).toBe(403);
    expect((await request(app).get('/api/usuarios?rol=tecnico').set('Authorization', bearer('admin'))).status).toBe(200);
    expect(usuarioModel.listar).toHaveBeenCalledWith({ rol: 'TECNICO' });
  });

  test('técnicos y admin consultan técnicos activos', async () => {
    usuarioModel.listarTecnicosActivos.mockResolvedValue([{ id: 2, nombre: 'Carlos' }]);
    expect((await request(app).get('/api/usuarios/tecnicos').set('Authorization', bearer('tecnico'))).status).toBe(200);
    expect((await request(app).get('/api/usuarios/tecnicos').set('Authorization', bearer('usuario'))).status).toBe(403);
  });

  test('crea usuarios con contraseña hasheada', async () => {
    usuarioModel.crear.mockImplementation(async (datos) => ({ id: 9, ...datos, passwordHash: undefined }));
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', bearer('admin'))
      .send({ nombre: 'Pedro Soto', email: 'Pedro@Empresa.com', password: 'Segura123', rol: 'tecnico' });

    expect(res.status).toBe(201);
    const datos = usuarioModel.crear.mock.calls[0][0];
    expect(datos).toMatchObject({ nombre: 'Pedro Soto', email: 'pedro@empresa.com', rol: 'TECNICO' });
    expect(datos.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(datos.password).toBeUndefined();
  });

  test('exige contraseña con letras y números', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', bearer('admin'))
      .send({ nombre: 'Pedro Soto', email: 'pedro@empresa.com', password: 'solamenteletras', rol: 'USUARIO' });
    expect(res.status).toBe(400);
    expect(res.body.detalles[0].campo).toBe('password');
  });

  test('correo duplicado responde 409', async () => {
    usuarioModel.crear.mockRejectedValue(Object.assign(new Error('duplicado'), { code: '23505' }));
    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', bearer('admin'))
      .send({ nombre: 'Pedro Soto', email: 'pedro@empresa.com', password: 'Segura123', rol: 'USUARIO' });
    expect(res.status).toBe(409);
  });

  test('activa y desactiva usuarios, pero no la propia cuenta', async () => {
    usuarioModel.cambiarActivo.mockResolvedValue({ id: 4, activo: false });
    expect(
      (await request(app).patch('/api/usuarios/4/estado').set('Authorization', bearer('admin')).send({ activo: false })).status
    ).toBe(200);
    expect(
      (await request(app).patch('/api/usuarios/1/estado').set('Authorization', bearer('admin')).send({ activo: false })).status
    ).toBe(400);
  });

  test('404 al cambiar el estado de un usuario inexistente', async () => {
    usuarioModel.cambiarActivo.mockResolvedValue(null);
    const res = await request(app).patch('/api/usuarios/77/estado').set('Authorization', bearer('admin')).send({ activo: true });
    expect(res.status).toBe(404);
  });
});
