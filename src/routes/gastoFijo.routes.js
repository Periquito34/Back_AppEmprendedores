const express = require('express');
const router = express.Router();
const { createGastoFijo, markGastoFijoAsPaid, getGastosFijosByBusiness, getGastosFijosPagadosByMonth, getTotalGastosFijosByBusiness } = require('../controllers/gastoFijo.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createGastoFijo);
router.patch('/:idGasto/mark-as-paid', verifyFirebaseToken, markGastoFijoAsPaid);
router.get('/business/:idNegocio', verifyFirebaseToken, getGastosFijosByBusiness);
router.get('/business/:idNegocio/pagados/:year/:month', verifyFirebaseToken, getGastosFijosPagadosByMonth);
router.get('/business/:idNegocio/total', verifyFirebaseToken, getTotalGastosFijosByBusiness);

module.exports = router;