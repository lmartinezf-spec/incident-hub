const { Router } = require('express');
const controlador = require('../controllers/auth.controller');
const esquemas = require('../validators/auth.validators');
const { validar } = require('../middleware/validar');
const { autenticar } = require('../middleware/auth');

const router = Router();

router.post('/login', validar(esquemas.login), controlador.login);
router.get('/me', autenticar, controlador.perfil);

module.exports = router;