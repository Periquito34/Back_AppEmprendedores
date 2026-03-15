const express = require('express');
const router = express.Router();
const { createGastoFijo, getGastosFijosPagados } = require('../controllers/gastoFijoPagado.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createGastoFijo);
router.get('/', verifyFirebaseToken, getGastosFijosPagados);

module.exports = router;