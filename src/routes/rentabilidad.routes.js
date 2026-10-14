const express = require('express');
const router = express.Router();

const { createRentabilidadMensual, getRentabilidadLive } = require('../controllers/rentabilidad.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');
router.post('/:idNegocio/:year/:month', verifyFirebaseToken, requireNegocioOwner(), createRentabilidadMensual);
router.get('/live/:idNegocio/:year/:month', verifyFirebaseToken, requireNegocioOwner(), getRentabilidadLive);

module.exports = router;
