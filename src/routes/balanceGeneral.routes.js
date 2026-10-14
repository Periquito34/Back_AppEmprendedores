const express = require('express');
const router = express.Router();

const { getBalanceGeneral } = require('../controllers/balanceGeneral.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.get('/:idNegocio', verifyFirebaseToken, getBalanceGeneral);

module.exports = router;
