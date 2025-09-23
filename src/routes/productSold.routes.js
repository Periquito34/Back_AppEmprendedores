const express = require('express');
const router = express.Router();
const { createVenta, getProductosVendidosByProducto, getProductosVendidosByMonth, getResumenVentasByMonth, getResumenVentasByMonthByBusiness } = require('../controllers/productsold.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

router.post('/', verifyFirebaseToken, createVenta);
router.get('/ventas/producto/:idProducto', verifyFirebaseToken, getProductosVendidosByProducto);
router.get('/ventas/producto/:idProducto/:year/:month', verifyFirebaseToken, getProductosVendidosByMonth);
router.get('/ventas/producto/resumen/:idProducto/:year/:month', verifyFirebaseToken, getResumenVentasByMonth);
router.get('/ventas/producto/negocio/:idNegocio/:year/:month', verifyFirebaseToken, getResumenVentasByMonthByBusiness);

module.exports = router;