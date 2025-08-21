const express = require('express');
const router = express.Router();
const { createProduct } = require('../controllers/product.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createProduct);

module.exports = router;