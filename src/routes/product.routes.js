const express = require('express');
const router = express.Router();
const { createProduct, decreaseStock, getProductsByBusiness  } = require('../controllers/product.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createProduct);
router.post('/decrease-stock', verifyFirebaseToken, decreaseStock);
router.get('/business/:idNegocio', verifyFirebaseToken, getProductsByBusiness);

module.exports = router;