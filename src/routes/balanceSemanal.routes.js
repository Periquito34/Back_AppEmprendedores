const express = require('express');
const router = express.Router();
const { createBalanceSemanal, getAllBalancesSemanales, getBalancesByNegocio } = require('../controllers/balanceSemanal.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, requireNegocioOwner('body'), createBalanceSemanal);
router.get('/', verifyFirebaseToken, getAllBalancesSemanales);
router.get('/negocio/:idNegocio', verifyFirebaseToken, requireNegocioOwner(), getBalancesByNegocio);

module.exports = router;