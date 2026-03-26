const express = require('express');
const router = express.Router();
const { createRecomendacion, getAllRecomendaciones, getRecomendacionesByTipo, getRecomendacionesByNegocio } = require('../controllers/aiRecomendation.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createRecomendacion);
router.get('/', verifyFirebaseToken, getAllRecomendaciones);
router.get('/tipo/:tipo', verifyFirebaseToken, getRecomendacionesByTipo);
router.get('/negocio/:idNegocio', verifyFirebaseToken, getRecomendacionesByNegocio);

module.exports = router;