const { Router } = require('express');

const router = Router();

router.use('/health', require('./health.routes'));
router.use('/auth', require('./auth.routes'));
router.use('/usuarios', require('./usuarios.routes'));

module.exports = router;