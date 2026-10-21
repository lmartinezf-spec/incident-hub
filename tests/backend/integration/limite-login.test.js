// TD-02: verifica que el login bloquee la fuerza bruta.
process.env.LOGIN_MAX_INTENTOS = '3';

jest.mock('../../../backend/src/models/usuario.model');

const request = require('supertest');
const app = require('../../../backend/src/app');
const usuarioModel = require('../../../backend/src/models/usuario.model');

describe('límite de intentos de login', () => {
  test('después de 3 intentos fallidos responde 429', async () => {
    usuarioModel.buscarPorEmail.mockResolvedValue(null);
    const intento = () => request(app).post('/api/auth/login').send({ email: 'x@empresa.com', password: 'mala' });

    for (let i = 0; i < 3; i += 1) {
      expect((await intento()).status).toBe(401);
    }
    const bloqueado = await intento();
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error).toMatch(/Demasiados intentos/);
  });
});
