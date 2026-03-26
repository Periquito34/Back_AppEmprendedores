const express = require('express');
const router = express.Router();
const { generarPdfBalanceSemanal, getReportesBalanceByNegocio } = require('../controllers/balancePDF.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/generar/:idBalance', verifyFirebaseToken, generarPdfBalanceSemanal);
router.get('/negocio/:idNegocio', verifyFirebaseToken, getReportesBalanceByNegocio);

module.exports = router;