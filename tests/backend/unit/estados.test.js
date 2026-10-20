const {
  esTransicionValida,
  puedeVerIncidente,
  evaluarCambioEstado,
  requiereComentario,
  accionesDisponibles
} = require('../../../backend/src/utils/estados');

const admin = { id: 1, rol: 'ADMIN' };
const tecnico = { id: 2, rol: 'TECNICO' };
const otroTecnico = { id: 3, rol: 'TECNICO' };
const reportante = { id: 4, rol: 'USUARIO' };
const otroUsuario = { id: 5, rol: 'USUARIO' };

const incidente = (estado, extra = {}) => ({
  id: 10,
  estado,
  reportado_por: reportante.id,
  tecnico_id: estado === 'NUEVO' ? null : tecnico.id,
  ...extra
});

describe('máquina de estados', () => {
  test.each([
    ['NUEVO', 'ASIGNADO', true],
    ['ASIGNADO', 'EN_PROCESO', true],
    ['EN_PROCESO', 'RESUELTO', true],
    ['RESUELTO', 'CERRADO', true],
    ['RESUELTO', 'EN_PROCESO', true],
    ['NUEVO', 'RESUELTO', false],
    ['ASIGNADO', 'CERRADO', false],
    ['CERRADO', 'EN_PROCESO', false],
    ['EN_PROCESO', 'NUEVO', false]
  ])('%s → %s es %s', (actual, nuevo, esperado) => {
    expect(esTransicionValida(actual, nuevo)).toBe(esperado);
  });

  test('un estado desconocido no tiene transiciones', () => {
    expect(esTransicionValida('INVENTADO', 'CERRADO')).toBe(false);
  });
});

describe('visibilidad', () => {
  test('admin ve cualquier incidente', () => {
    expect(puedeVerIncidente(incidente('NUEVO'), admin)).toBe(true);
  });

  test('el reportante ve su incidente y otro usuario no', () => {
    expect(puedeVerIncidente(incidente('NUEVO'), reportante)).toBe(true);
    expect(puedeVerIncidente(incidente('NUEVO'), otroUsuario)).toBe(false);
  });

  test('solo el técnico asignado ve el incidente', () => {
    expect(puedeVerIncidente(incidente('ASIGNADO'), tecnico)).toBe(true);
    expect(puedeVerIncidente(incidente('ASIGNADO'), otroTecnico)).toBe(false);
  });
});

describe('evaluarCambioEstado', () => {
  test('rechaza estados desconocidos con 400', () => {
    expect(evaluarCambioEstado(incidente('NUEVO'), admin, 'PAUSADO')).toMatchObject({ permitido: false, status: 400 });
  });

  test('ASIGNADO solo se alcanza asignando técnico (409)', () => {
    expect(evaluarCambioEstado(incidente('NUEVO'), admin, 'ASIGNADO')).toMatchObject({ permitido: false, status: 409 });
  });

  test('una transición inválida responde 409', () => {
    const resultado = evaluarCambioEstado(incidente('NUEVO'), admin, 'CERRADO');
    expect(resultado).toMatchObject({ permitido: false, status: 409 });
    expect(resultado.motivo).toContain('NUEVO → CERRADO');
  });

  test('el técnico asignado inicia y resuelve', () => {
    expect(evaluarCambioEstado(incidente('ASIGNADO'), tecnico, 'EN_PROCESO').permitido).toBe(true);
    expect(evaluarCambioEstado(incidente('EN_PROCESO'), tecnico, 'RESUELTO').permitido).toBe(true);
  });

  test('otro técnico o el usuario no pueden resolver (403)', () => {
    expect(evaluarCambioEstado(incidente('EN_PROCESO'), otroTecnico, 'RESUELTO')).toMatchObject({ status: 403 });
    expect(evaluarCambioEstado(incidente('EN_PROCESO'), reportante, 'RESUELTO')).toMatchObject({ status: 403 });
  });

  test('el reportante cierra o reabre; el técnico no puede cerrar', () => {
    expect(evaluarCambioEstado(incidente('RESUELTO'), reportante, 'CERRADO').permitido).toBe(true);
    expect(evaluarCambioEstado(incidente('RESUELTO'), reportante, 'EN_PROCESO').permitido).toBe(true);
    expect(evaluarCambioEstado(incidente('RESUELTO'), tecnico, 'CERRADO')).toMatchObject({ status: 403 });
  });

  test('admin puede realizar cualquier transición válida', () => {
    expect(evaluarCambioEstado(incidente('ASIGNADO'), admin, 'EN_PROCESO').permitido).toBe(true);
    expect(evaluarCambioEstado(incidente('RESUELTO'), admin, 'CERRADO').permitido).toBe(true);
  });
});

describe('requiereComentario', () => {
  test('resolver y reabrir exigen comentario', () => {
    expect(requiereComentario('EN_PROCESO', 'RESUELTO')).toBe(true);
    expect(requiereComentario('RESUELTO', 'EN_PROCESO')).toBe(true);
    expect(requiereComentario('ASIGNADO', 'EN_PROCESO')).toBe(false);
    expect(requiereComentario('RESUELTO', 'CERRADO')).toBe(false);
  });
});

describe('accionesDisponibles', () => {
  test('admin con incidente nuevo puede asignar y comentar', () => {
    expect(accionesDisponibles(incidente('NUEVO'), admin)).toEqual({ asignar: true, comentar: true, estados: [] });
  });

  test('técnico asignado ve la siguiente transición', () => {
    expect(accionesDisponibles(incidente('ASIGNADO'), tecnico)).toEqual({
      asignar: false,
      comentar: true,
      estados: ['EN_PROCESO']
    });
  });

  test('reportante con incidente resuelto puede cerrar o reabrir', () => {
    expect(accionesDisponibles(incidente('RESUELTO'), reportante).estados).toEqual(['CERRADO', 'EN_PROCESO']);
  });

  test('un incidente cerrado no admite acciones', () => {
    expect(accionesDisponibles(incidente('CERRADO'), admin)).toEqual({ asignar: false, comentar: false, estados: [] });
  });
});
