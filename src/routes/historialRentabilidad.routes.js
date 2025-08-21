const express = require('express');
const router = express.Router();
const { createHistorial } = require('../controllers/historialRentabilidad.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createHistorial);

module.exports = router;