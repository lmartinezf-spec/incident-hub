jest.mock('../../../backend/src/models/usuario.model');

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../../backend/src/app');
const usuarioModel = require('../../../backend/src/models/usuario.model');
const { bearer, USUARIOS } = require('../helpers');

const HASH = bcrypt.hashSync('Clave12345', 4);

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.resetAllMocks());

  test('devuelve token y usuario sin password_hash', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue({ ...USUARIOS.admin, activo: true, password_hash: HASH });

    const res = await request(app).post('/api/auth/login').send({ email: 'ADMIN@empresa.com', password: 'Clave12345' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.usuario).toMatchObject({ id: 1, rol: 'ADMIN' });
    expect(res.body.usuario.password_hash).toBeUndefined();
    expect(usuarioModel.buscarPorEmail).toHaveBeenCalledWith('admin@empresa.com');
  });

  test('contraseña incorrecta responde 401 genérico', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue({ ...USUARIOS.admin, activo: true, password_hash: HASH });
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@empresa.com', password: 'otra' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas');
  });

  test('usuario inexistente o inactivo responde el mismo 401', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValueOnce(null);
    const inexistente = await request(app).post('/api/auth/login').send({ email: 'x@empresa.com', password: 'Clave12345' });

    usuarioModel.buscarPorEmail.mockResolvedValueOnce({ ...USUARIOS.admin, activo: false, password_hash: HASH });
    const inactivo = await request(app).post('/api/auth/login').send({ email: 'admin@empresa.com', password: 'Clave12345' });

    expect(inexistente.status).toBe(401);
    expect(inactivo.body).toEqual(inexistente.body);
  });

  test('valida el formato del correo', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'no-es-correo', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.detalles[0].campo).toBe('email');
  });
});

describe('GET /api/auth/me', () => {
  beforeEach(() => jest.resetAllMocks());

  test('requiere token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('devuelve el perfil del usuario autenticado', async () => {
    usuarioModel.obtenerPorId.mockResolvedValue({ ...USUARIOS.tecnico, activo: true });
    const res = await request(app).get('/api/auth/me').set('Authorization', bearer('tecnico'));
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(USUARIOS.tecnico.email);
  });

  test('rechaza cuentas desactivadas', async () => {
    usuarioModel.obtenerPorId.mockResolvedValue({ ...USUARIOS.tecnico, activo: false });
    const res = await request(app).get('/api/auth/me').set('Authorization', bearer('tecnico'));
    expect(res.status).toBe(401);
  });
});
