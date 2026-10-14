const express = require('express');
const router = express.Router();
const { generarPdfBalanceSemanal, descargarPdfBalanceSemanal, getReportesBalanceByNegocio } = require('../controllers/balancePDF.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/generar/:idBalance', verifyFirebaseToken, requireRecursoOwner('balancesSemanales', 'idBalance'), generarPdfBalanceSemanal);
router.get('/descargar/:idBalance', verifyFirebaseToken, requireRecursoOwner('balancesSemanales', 'idBalance'), descargarPdfBalanceSemanal);
router.get('/negocio/:idNegocio', verifyFirebaseToken, requireNegocioOwner(), getReportesBalanceByNegocio);

module.exports = router;