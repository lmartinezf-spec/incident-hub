const { Router } = require('express');
const controlador = require('../controllers/usuarios.controller');
const esquemas = require('../validators/usuario.validators');
const { validar } = require('../middleware/validar');
const { autenticar, autorizar } = require('../middleware/auth');

const router = Router();

router.use(autenticar);

router.get('/tecnicos', autorizar('ADMIN', 'TECNICO'), controlador.listarTecnicos);
router.get('/', autorizar('ADMIN'), validar(esquemas.listar), controlador.listar);
router.post('/', autorizar('ADMIN'), validar(esquemas.crear), controlador.crear);
router.patch('/:id/estado', autorizar('ADMIN'), validar(esquemas.cambiarEstado), controlador.cambiarEstado);

module.exports = router;
