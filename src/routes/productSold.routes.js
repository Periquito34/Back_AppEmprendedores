const express = require('express');
const router = express.Router();
const { createVenta } = require('../controllers/productsold.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createVenta);

module.exports = router;