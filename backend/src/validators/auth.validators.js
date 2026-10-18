const login = {
  body: {
    email: { tipo: 'email', requerido: true },
    password: { tipo: 'texto', requerido: true, max: 100 }
  }
};

module.exports = { login };
