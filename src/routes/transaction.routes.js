const express = require('express');
const router = express.Router();
const { createTransaccion } = require('../controllers/transaction.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createTransaccion);

module.exports = router;