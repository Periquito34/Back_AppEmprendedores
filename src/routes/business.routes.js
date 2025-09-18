const express = require('express');
const router = express.Router();
const { createBusiness, getBusinessByUserId } = require('../controllers/business.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createBusiness);

// Obtener negocios por ID de usuario
router.get('/user/:uid', verifyFirebaseToken, getBusinessByUserId);

module.exports = router;