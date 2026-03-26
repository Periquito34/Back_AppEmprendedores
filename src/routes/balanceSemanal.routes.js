const express = require('express');
const router = express.Router();
const { createBalanceSemanal, getAllBalancesSemanales, getBalancesByNegocio } = require('../controllers/balanceSemanal.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createBalanceSemanal);
router.get('/', verifyFirebaseToken, getAllBalancesSemanales);
router.get('/negocio/:idNegocio', verifyFirebaseToken, getBalancesByNegocio);

module.exports = router;