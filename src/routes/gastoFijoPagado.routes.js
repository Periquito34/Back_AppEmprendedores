const express = require('express');
const router = express.Router();
const { createGastoFijo, getGastosFijosPagados } = require('../controllers/gastoFijoPagado.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, requireNegocioOwner('body'), createGastoFijo);
router.get('/', verifyFirebaseToken, getGastosFijosPagados);

module.exports = router;