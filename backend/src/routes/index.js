const { Router } = require('express');

const router = Router();

router.use('/health', require('./health.routes'));
router.use('/auth', require('./auth.routes'));
router.use('/usuarios', require('./usuarios.routes'));
router.use('/catalogos', require('./catalogos.routes'));
router.use('/incidentes', require('./incidentes.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
