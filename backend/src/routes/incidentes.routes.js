const { Router } = require('express');
const controlador = require('../controllers/incidentes.controller');
const esquemas = require('../validators/incidente.validators');
const { validar } = require('../middleware/validar');
const { autenticar, autorizar } = require('../middleware/auth');

const router = Router();

router.use(autenticar);

router.get('/', validar(esquemas.listar), controlador.listar);
router.post('/', validar(esquemas.crear), controlador.crear);
router.get('/:id', validar(esquemas.idParam), controlador.obtener);
router.patch('/:id/asignar', autorizar('ADMIN'), validar(esquemas.asignar), controlador.asignar);
router.patch('/:id/estado', validar(esquemas.cambiarEstado), controlador.cambiarEstado);
router.get('/:id/bitacora', validar(esquemas.idParam), controlador.bitacora);
router.post('/:id/comentarios', validar(esquemas.comentar), controlador.comentar);

module.exports = router;
