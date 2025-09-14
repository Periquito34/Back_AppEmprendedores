const express = require('express');
const router = express.Router();
const { createVenta, getProductosVendidosByProducto, getProductosVendidosByMonth, getResumenVentasByMonth } = require('../controllers/productsold.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createVenta);
router.get('/ventas/producto/:idProducto', verifyFirebaseToken, getProductosVendidosByProducto);
router.get('/ventas/producto/:idProducto/:year/:month', verifyFirebaseToken, getProductosVendidosByMonth);
router.get('/ventas/producto/resumen/:idProducto/:year/:month', verifyFirebaseToken, getResumenVentasByMonth);


module.exports = router;