const express = require('express');
const router = express.Router();
const { createRecomendacion } = require('../controllers/aiRecomendation.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createRecomendacion);

module.exports = router;