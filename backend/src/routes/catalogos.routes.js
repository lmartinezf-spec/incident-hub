const { Router } = require('express');
const controlador = require('../controllers/catalogos.controller');
const { autenticar } = require('../middleware/auth');

const router = Router();

router.get('/', autenticar, controlador.obtener);

module.exports = router;
