const express = require('express');
const router = express.Router();
const { createBusiness, getBusinessByUserId, updateBusiness } = require('../controllers/business.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, createBusiness);

// Obtener negocios por ID de usuario
router.get('/user/:uid', verifyFirebaseToken, requireSameUser('uid'), getBusinessByUserId);

// Actualizar negocio
router.put('/:idNegocio', verifyFirebaseToken, requireNegocioOwner(), updateBusiness);

module.exports = router;