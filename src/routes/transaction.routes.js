const express = require('express');
const router = express.Router();
const { createTransaccion, getTransaccionesByNegocio, getEgresosByMonth, getEgresosByMonthShort } = require('../controllers/transaction.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, requireNegocioOwner('body'), createTransaccion);
router.get('/negocios/:idNegocio/transacciones', verifyFirebaseToken, requireNegocioOwner(), getTransaccionesByNegocio);
router.get('/negocios/:idNegocio/egresos/:year/:month', verifyFirebaseToken, requireNegocioOwner(), getEgresosByMonth);
router.get('/negocios/:idNegocio/egresos/:year/:month/short', verifyFirebaseToken, requireNegocioOwner(), getEgresosByMonthShort);


module.exports = router;