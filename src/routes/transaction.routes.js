const express = require('express');
const router = express.Router();
const { createTransaccion, getTransaccionesByNegocio } = require('../controllers/transaction.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createTransaccion);
router.get('/negocios/:idNegocio/transacciones', verifyFirebaseToken, getTransaccionesByNegocio);

module.exports = router;