const express = require('express');
const router = express.Router();
const { createGastoFijo, markGastoFijoAsPaid, getGastosFijosByBusiness, getGastosFijosPagadosByMonth, getTotalGastosFijosByBusiness } = require('../controllers/gastoFijo.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, requireNegocioOwner('body'), createGastoFijo);
router.patch('/:idGasto/mark-as-paid', verifyFirebaseToken, requireRecursoOwner('gastosFijos', 'idGasto'), markGastoFijoAsPaid);
router.get('/business/:idNegocio', verifyFirebaseToken, requireNegocioOwner(), getGastosFijosByBusiness);
router.get('/business/:idNegocio/pagados/:year/:month', verifyFirebaseToken, requireNegocioOwner(), getGastosFijosPagadosByMonth);
router.get('/business/:idNegocio/total', verifyFirebaseToken, requireNegocioOwner(), getTotalGastosFijosByBusiness);

module.exports = router;