const jwt = require('jsonwebtoken');
const { autenticar, autorizar, firmarToken } = require('../../../backend/src/middleware/auth');

const usuario = { id: 7, nombre: 'Ana López', email: 'ana@empresa.com', rol: 'TECNICO' };

function ejecutar(middleware, req) {
  const next = jest.fn();
  middleware(req, {}, next);
  return next;
}

describe('firmarToken', () => {
  test('incluye id como subject y los datos del usuario', () => {
    const payload = jwt.decode(firmarToken(usuario));
    expect(payload).toMatchObject({ sub: '7', nombre: 'Ana López', rol: 'TECNICO' });
    expect(payload.exp).toBeGreaterThan(payload.iat);
  });
});

describe('autenticar', () => {
  test('sin encabezado responde 401', () => {
    const next = ejecutar(autenticar, { headers: {} });
    expect(next.mock.calls[0][0].status).toBe(401);
  });

  test('con token válido carga req.usuario', () => {
    const req = { headers: { authorization: `Bearer ${firmarToken(usuario)}` } };
    const next = ejecutar(autenticar, req);
    expect(next).toHaveBeenCalledWith();
    expect(req.usuario).toEqual(usuario);
  });

  test('con token alterado responde 401', () => {
    const token = firmarToken(usuario).slice(0, -2) + 'xx';
    const next = ejecutar(autenticar, { headers: { authorization: `Bearer ${token}` } });
    expect(next.mock.calls[0][0].message).toBe('Token inválido o expirado');
  });

  test('con token firmado por otra clave responde 401', () => {
    const token = jwt.sign({ rol: 'ADMIN' }, 'otra-clave', { subject: '1' });
    const next = ejecutar(autenticar, { headers: { authorization: `Bearer ${token}` } });
    expect(next.mock.calls[0][0].status).toBe(401);
  });
});

describe('autorizar', () => {
  test('permite roles incluidos', () => {
    expect(ejecutar(autorizar('ADMIN', 'TECNICO'), { usuario })).toHaveBeenCalledWith();
  });

  test('bloquea roles no incluidos con 403', () => {
    const next = ejecutar(autorizar('ADMIN'), { usuario });
    expect(next.mock.calls[0][0].status).toBe(403);
  });
});
