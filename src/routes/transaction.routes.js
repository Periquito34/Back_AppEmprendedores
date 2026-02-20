const express = require('express');
const router = express.Router();
const { createTransaccion, getTransaccionesByNegocio, getEgresosByMonth, getEgresosByMonthShort } = require('../controllers/transaction.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createTransaccion);
router.get('/negocios/:idNegocio/transacciones', verifyFirebaseToken, getTransaccionesByNegocio);
router.get('/negocios/:idNegocio/egresos/:year/:month', verifyFirebaseToken, getEgresosByMonth);
router.get('/negocios/:idNegocio/egresos/:year/:month/short', verifyFirebaseToken, getEgresosByMonthShort);


module.exports = router;