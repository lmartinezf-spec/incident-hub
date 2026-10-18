const { Router } = require('express');
const controlador = require('../controllers/health.controller');

const router = Router();

router.get('/', controlador.estado);

module.exports = router;
