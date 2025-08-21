const express = require('express');
const router = express.Router();
const { createGastoFijo } = require('../controllers/gastoFijo.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createGastoFijo);

module.exports = router;