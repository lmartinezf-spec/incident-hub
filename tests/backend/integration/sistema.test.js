jest.mock('../../../backend/src/config/db');
jest.mock('../../../backend/src/models/dashboard.model');
jest.mock('../../../backend/src/models/catalogo.model');

const request = require('supertest');
const app = require('../../../backend/src/app');
const db = require('../../../backend/src/config/db');
const dashboardModel = require('../../../backend/src/models/dashboard.model');
const catalogoModel = require('../../../backend/src/models/catalogo.model');
const { bearer } = require('../helpers');
const { version } = require('../../../backend/package.json');

beforeEach(() => jest.resetAllMocks());

describe('GET /api/health', () => {
  test('informa versión y base de datos disponible', async () => {
    db.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', version, baseDatos: 'ok' });
  });

  test('responde 503 si la base de datos no responde', async () => {
    db.query.mockRejectedValue(new Error('ECONNREFUSED'));
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.baseDatos).toBe('error');
  });

  test('incluye encabezados de seguridad', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('GET /api/dashboard', () => {
  const indicadores = {
    resumen: { total: 3, abiertos: 2, resueltos: 0, cerrados: 1, criticos: 1, sin_asignar: 1 },
    porEstado: [],
    porPrioridad: [],
    porCategoria: [],
    porTecnico: []
  };

  test('ADMIN y TECNICO consultan indicadores', async () => {
    dashboardModel.obtenerIndicadores.mockResolvedValue(indicadores);
    const res = await request(app).get('/api/dashboard').set('Authorization', bearer('tecnico'));
    expect(res.status).toBe(200);
    expect(res.body.resumen.criticos).toBe(1);
  });

  test('USUARIO no tiene acceso', async () => {
    const res = await request(app).get('/api/dashboard').set('Authorization', bearer('usuario'));
    expect(res.status).toBe(403);
  });
});

describe('GET /api/catalogos', () => {
  test('devuelve categorías, prioridades y estados', async () => {
    catalogoModel.listarCategorias.mockResolvedValue([{ id: 1, nombre: 'Hardware' }]);
    const res = await request(app).get('/api/catalogos').set('Authorization', bearer('usuario'));
    expect(res.status).toBe(200);
    expect(res.body.prioridades).toEqual(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']);
    expect(res.body.estados).toHaveLength(5);
  });
});

describe('manejo de errores', () => {
  test('ruta inexistente en /api responde 404 en JSON', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/Ruta no encontrada/);
  });

  test('JSON mal formado responde 400', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{malo');
    expect(res.status).toBe(400);
  });

  test('errores inesperados responden 500', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    dashboardModel.obtenerIndicadores.mockRejectedValue(new Error('fallo inesperado'));
    const res = await request(app).get('/api/dashboard').set('Authorization', bearer('admin'));
    expect(res.status).toBe(500);
  });
});
