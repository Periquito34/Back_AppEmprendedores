const express = require('express');
const router = express.Router();
const { createProduct, decreaseStock, getProductsByBusiness, updateProduct  } = require('../controllers/product.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, requireNegocioOwner('body'), createProduct);
router.post('/decrease-stock', verifyFirebaseToken, requireRecursoOwner('products', 'idProducto', { from: 'body' }), decreaseStock);
router.get('/business/:idNegocio', verifyFirebaseToken, requireNegocioOwner(), getProductsByBusiness);
router.put('/:idProducto', verifyFirebaseToken, requireRecursoOwner('products', 'idProducto'), updateProduct);


module.exports = router;