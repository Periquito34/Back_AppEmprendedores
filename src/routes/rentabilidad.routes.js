const express = require('express');
const router = express.Router();

const { createRentabilidadMensual, getRentabilidadLive } = require('../controllers/rentabilidad.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
router.post('/:idNegocio/:year/:month', verifyFirebaseToken, createRentabilidadMensual);
router.get('/live/:idNegocio/:year/:month', verifyFirebaseToken, getRentabilidadLive);

module.exports = router;
