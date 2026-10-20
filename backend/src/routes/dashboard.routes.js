const { Router } = require('express');
const controlador = require('../controllers/dashboard.controller');
const { autenticar, autorizar } = require('../middleware/auth');

const router = Router();

router.get('/', autenticar, autorizar('ADMIN', 'TECNICO'), controlador.obtener);

module.exports = router;
