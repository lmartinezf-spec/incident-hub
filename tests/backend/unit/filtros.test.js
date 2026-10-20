const { construirFiltros, normalizarPaginacion } = require('../../../backend/src/utils/filtros');

const admin = { id: 1, rol: 'ADMIN' };

describe('construirFiltros', () => {
  test('admin sin filtros no genera WHERE', () => {
    expect(construirFiltros({}, admin)).toEqual({ where: '', params: [] });
  });

  test('usuario solo ve lo que reportó', () => {
    expect(construirFiltros({}, { id: 9, rol: 'USUARIO' })).toEqual({
      where: 'WHERE i.reportado_por = $1',
      params: [9]
    });
  });

  test('técnico ve lo asignado o lo que reportó', () => {
    expect(construirFiltros({}, { id: 2, rol: 'TECNICO' })).toEqual({
      where: 'WHERE (i.tecnico_id = $1 OR i.reportado_por = $1)',
      params: [2]
    });
  });

  test('combina filtros con parámetros numerados en orden', () => {
    const { where, params } = construirFiltros(
      { estado: 'NUEVO', prioridad: 'ALTA', categoriaId: 3, tecnicoId: 2, q: 'impresora' },
      admin
    );
    expect(where).toBe(
      'WHERE i.estado = $1 AND i.prioridad = $2 AND i.categoria_id = $3 AND i.tecnico_id = $4 ' +
        'AND (i.titulo ILIKE $5 OR i.descripcion ILIKE $5)'
    );
    expect(params).toEqual(['NUEVO', 'ALTA', 3, 2, '%impresora%']);
  });

  test('sinAsignar tiene prioridad sobre tecnicoId', () => {
    const { where, params } = construirFiltros({ sinAsignar: true, tecnicoId: 2 }, admin);
    expect(where).toBe('WHERE i.tecnico_id IS NULL');
    expect(params).toEqual([]);
  });

  test('la visibilidad del rol se mantiene junto a otros filtros', () => {
    const { where, params } = construirFiltros({ estado: 'CERRADO' }, { id: 9, rol: 'USUARIO' });
    expect(where).toBe('WHERE i.reportado_por = $1 AND i.estado = $2');
    expect(params).toEqual([9, 'CERRADO']);
  });
});

describe('normalizarPaginacion', () => {
  test('usa valores por defecto', () => {
    expect(normalizarPaginacion()).toEqual({ page: 1, limit: 10, offset: 0 });
  });

  test('calcula el offset y limita a 100 registros', () => {
    expect(normalizarPaginacion({ page: 3, limit: 20 })).toEqual({ page: 3, limit: 20, offset: 40 });
    expect(normalizarPaginacion({ page: 1, limit: 1000 }).limit).toBe(100);
  });
});
