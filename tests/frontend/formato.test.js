import {
  codigoIncidente,
  completarSerie,
  construirQuery,
  etiquetaTransicion,
  formatearFecha,
  porcentaje,
  requiereComentario,
  tiempoRelativo,
} from '../../frontend/src/utils/formato.js'

describe('codigoIncidente', () => {
  test('rellena con ceros a 4 dígitos', () => {
    expect(codigoIncidente(7)).toBe('INC-0007')
    expect(codigoIncidente(12345)).toBe('INC-12345')
  })
})

describe('construirQuery', () => {
  test('omite valores vacíos y codifica el resto', () => {
    expect(construirQuery({ estado: 'NUEVO', q: 'red caída', prioridad: '', tecnicoId: null, sinAsignar: false })).toBe(
      '?estado=NUEVO&q=red+ca%C3%ADda',
    )
  })

  test('sin filtros devuelve cadena vacía', () => {
    expect(construirQuery({})).toBe('')
    expect(construirQuery()).toBe('')
  })
})

describe('tiempoRelativo', () => {
  const ahora = new Date('2026-10-16T12:00:00Z')

  test.each([
    ['2026-10-16T11:59:40Z', 'hace un momento'],
    ['2026-10-16T11:45:00Z', 'hace 15 min'],
    ['2026-10-16T09:00:00Z', 'hace 3 h'],
    ['2026-10-15T10:00:00Z', 'hace 1 día'],
    ['2026-10-12T12:00:00Z', 'hace 4 días'],
  ])('%s → %s', (fecha, esperado) => {
    expect(tiempoRelativo(fecha, ahora)).toBe(esperado)
  })

  test('sin fecha devuelve guion', () => {
    expect(tiempoRelativo(null)).toBe('—')
  })
})

describe('formatearFecha', () => {
  test('valores vacíos o inválidos devuelven guion', () => {
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha('no-es-fecha')).toBe('—')
  })

  test('formatea una fecha válida', () => {
    expect(formatearFecha('2026-10-16T12:00:00Z')).toMatch(/2026/)
  })
})

describe('transiciones', () => {
  test('etiquetas de los botones según el estado actual', () => {
    expect(etiquetaTransicion('ASIGNADO', 'EN_PROCESO')).toBe('Iniciar atención')
    expect(etiquetaTransicion('RESUELTO', 'EN_PROCESO')).toBe('Reabrir incidente')
    expect(etiquetaTransicion('EN_PROCESO', 'RESUELTO')).toBe('Marcar como resuelto')
    expect(etiquetaTransicion('RESUELTO', 'CERRADO')).toBe('Confirmar y cerrar')
  })

  test('coincide con la regla del backend para pedir comentario', () => {
    expect(requiereComentario('EN_PROCESO', 'RESUELTO')).toBe(true)
    expect(requiereComentario('RESUELTO', 'EN_PROCESO')).toBe(true)
    expect(requiereComentario('RESUELTO', 'CERRADO')).toBe(false)
  })
})

describe('datos del dashboard', () => {
  test('porcentaje tolera total cero', () => {
    expect(porcentaje(3, 12)).toBe(25)
    expect(porcentaje(3, 0)).toBe(0)
  })

  test('completarSerie respeta el orden y rellena con cero', () => {
    const filas = [
      { estado: 'CERRADO', total: 4 },
      { estado: 'NUEVO', total: 2 },
    ]
    expect(completarSerie(filas, 'estado', ['NUEVO', 'ASIGNADO', 'CERRADO'])).toEqual([
      { estado: 'NUEVO', total: 2 },
      { estado: 'ASIGNADO', total: 0 },
      { estado: 'CERRADO', total: 4 },
    ])
  })
})
