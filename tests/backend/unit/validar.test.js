const { validar, validarObjeto, validarCampo } = require('../../../backend/src/middleware/validar');

describe('validarCampo', () => {
  test('campo requerido vacío produce error', () => {
    expect(validarCampo('titulo', '   ', { tipo: 'texto', requerido: true })).toEqual({ error: 'titulo es obligatorio' });
  });

  test('campo opcional vacío se omite', () => {
    expect(validarCampo('q', undefined, { tipo: 'texto' })).toEqual({ valor: undefined });
  });

  test('texto: recorta, aplica mayúsculas y valida enum', () => {
    expect(validarCampo('prioridad', ' alta ', { tipo: 'texto', mayusculas: true, enum: ['ALTA'] })).toEqual({
      valor: 'ALTA'
    });
    expect(validarCampo('prioridad', 'urgente', { tipo: 'texto', mayusculas: true, enum: ['ALTA'] }).error).toMatch(
      /uno de/
    );
  });

  test('texto: longitudes mínima y máxima', () => {
    expect(validarCampo('t', 'abc', { tipo: 'texto', min: 5 }).error).toMatch(/al menos 5/);
    expect(validarCampo('t', 'abcdef', { tipo: 'texto', max: 3 }).error).toMatch(/superar 3/);
    expect(validarCampo('t', 42, { tipo: 'texto' }).error).toMatch(/texto/);
  });

  test('texto: patrón con mensaje personalizado', () => {
    const reglas = { tipo: 'texto', patron: /\d/, mensajePatron: 'debe tener un número' };
    expect(validarCampo('password', 'sinnumeros', reglas)).toEqual({ error: 'debe tener un número' });
  });

  test('email: normaliza a minúsculas y rechaza formato inválido', () => {
    expect(validarCampo('email', ' Ana@Empresa.COM ', { tipo: 'email' })).toEqual({ valor: 'ana@empresa.com' });
    expect(validarCampo('email', 'no-es-correo', { tipo: 'email' }).error).toMatch(/correo/);
  });

  test('entero: convierte cadenas y valida rangos', () => {
    expect(validarCampo('id', '15', { tipo: 'entero', min: 1 })).toEqual({ valor: 15 });
    expect(validarCampo('id', '1.5', { tipo: 'entero' }).error).toMatch(/entero/);
    expect(validarCampo('id', 0, { tipo: 'entero', min: 1 }).error).toMatch(/mayor o igual/);
    expect(validarCampo('limit', 500, { tipo: 'entero', max: 100 }).error).toMatch(/menor o igual/);
  });

  test('booleano: acepta true/false como texto', () => {
    expect(validarCampo('activo', 'true', { tipo: 'booleano' })).toEqual({ valor: true });
    expect(validarCampo('activo', false, { tipo: 'booleano' })).toEqual({ valor: false });
    expect(validarCampo('activo', 'si', { tipo: 'booleano' }).error).toMatch(/true o false/);
  });

  test('tipo desconocido es un error de configuración', () => {
    expect(validarCampo('x', 'y', { tipo: 'fecha' }).error).toMatch(/desconocida/);
  });
});

describe('validarObjeto', () => {
  test('acumula errores de todos los campos', () => {
    const { errores } = validarObjeto({}, { a: { tipo: 'texto', requerido: true }, b: { tipo: 'entero', requerido: true } });
    expect(errores.map((e) => e.campo)).toEqual(['a', 'b']);
  });
});

describe('middleware validar', () => {
  test('deja los datos limpios en req.datos y llama a next()', () => {
    const req = { params: { id: '7' }, body: { texto: '  hola  ' } };
    const next = jest.fn();
    validar({ params: { id: { tipo: 'entero', requerido: true } }, body: { texto: { tipo: 'texto' } } })(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.datos).toEqual({ params: { id: 7 }, body: { texto: 'hola' } });
  });

  test('responde 400 con detalles cuando hay errores', () => {
    const next = jest.fn();
    validar({ body: { titulo: { tipo: 'texto', requerido: true } } })({ body: {} }, {}, next);
    const error = next.mock.calls[0][0];
    expect(error.status).toBe(400);
    expect(error.detalles).toEqual([{ campo: 'titulo', mensaje: 'titulo es obligatorio' }]);
  });
});
