const express = require('express');
const router = express.Router();
const { createProduct, decreaseStock, getProductsByBusiness, updateProduct  } = require('../controllers/product.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createProduct);
router.post('/decrease-stock', verifyFirebaseToken, decreaseStock);
router.get('/business/:idNegocio', verifyFirebaseToken, getProductsByBusiness);
router.put('/:idProducto', verifyFirebaseToken, updateProduct);


module.exports = router;