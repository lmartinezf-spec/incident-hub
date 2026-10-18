const { badRequest } = require('../utils/httpError');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esVacio(valor) {
  return valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');
}

/**
 * Valida y normaliza un valor según sus reglas.
 * Reglas soportadas: tipo (texto | email | entero | booleano), requerido, min, max,
 * enum, mayusculas, patron + mensajePatron.
 */
function validarCampo(campo, valor, reglas) {
  if (esVacio(valor)) {
    return reglas.requerido ? { error: `${campo} es obligatorio` } : { valor: undefined };
  }

  switch (reglas.tipo) {
    case 'texto': {
      if (typeof valor !== 'string') return { error: `${campo} debe ser texto` };
      let texto = valor.trim();
      if (reglas.mayusculas) texto = texto.toUpperCase();
      if (reglas.min && texto.length < reglas.min) {
        return { error: `${campo} debe tener al menos ${reglas.min} caracteres` };
      }
      if (reglas.max && texto.length > reglas.max) {
        return { error: `${campo} no puede superar ${reglas.max} caracteres` };
      }
      if (reglas.enum && !reglas.enum.includes(texto)) {
        return { error: `${campo} debe ser uno de: ${reglas.enum.join(', ')}` };
      }
      if (reglas.patron && !reglas.patron.test(texto)) {
        return { error: reglas.mensajePatron || `${campo} tiene un formato inválido` };
      }
      return { valor: texto };
    }
    case 'email': {
      if (typeof valor !== 'string' || !EMAIL_RE.test(valor.trim())) {
        return { error: `${campo} debe ser un correo electrónico válido` };
      }
      return { valor: valor.trim().toLowerCase() };
    }
    case 'entero': {
      const numero = typeof valor === 'string' ? Number(valor.trim()) : valor;
      if (!Number.isInteger(numero)) return { error: `${campo} debe ser un número entero` };
      if (reglas.min !== undefined && numero < reglas.min) {
        return { error: `${campo} debe ser mayor o igual a ${reglas.min}` };
      }
      if (reglas.max !== undefined && numero > reglas.max) {
        return { error: `${campo} debe ser menor o igual a ${reglas.max}` };
      }
      return { valor: numero };
    }
    case 'booleano': {
      if (valor === true || valor === 'true') return { valor: true };
      if (valor === false || valor === 'false') return { valor: false };
      return { error: `${campo} debe ser true o false` };
    }
    default:
      return { error: `Regla de validación desconocida para ${campo}` };
  }
}

function validarObjeto(datos = {}, esquema = {}) {
  const valores = {};
  const errores = [];
  for (const [campo, reglas] of Object.entries(esquema)) {
    const { valor, error } = validarCampo(campo, datos[campo], reglas);
    if (error) errores.push({ campo, mensaje: error });
    else if (valor !== undefined) valores[campo] = valor;
  }
  return { valores, errores };
}

/**
 * Middleware: valida body, query y params. Los valores limpios quedan en req.datos.
 * (En Express 5 req.query es de solo lectura, por eso no se sobrescribe.)
 */
function validar(esquema) {
  return (req, res, next) => {
    req.datos = {};
    const errores = [];
    for (const origen of ['params', 'query', 'body']) {
      if (!esquema[origen]) continue;
      const resultado = validarObjeto(req[origen] || {}, esquema[origen]);
      req.datos[origen] = resultado.valores;
      errores.push(...resultado.errores);
    }
    if (errores.length) return next(badRequest('Datos inválidos', errores));
    next();
  };
}

module.exports = { validar, validarObjeto, validarCampo };
