const express = require('express');
const router = express.Router();
const { createBusiness } = require('../controllers/business.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createBusiness);

module.exports = router;