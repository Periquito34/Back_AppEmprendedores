const express = require('express');
const router = express.Router();
const { createHistorial } = require('../controllers/historialRentabilidad.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, requireNegocioOwner('body'), createHistorial);

module.exports = router;