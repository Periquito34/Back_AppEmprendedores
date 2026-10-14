const express = require('express');
const router = express.Router();
const { createVenta, getProductosVendidosByProducto, getProductosVendidosByMonth, getResumenVentasByMonth, getResumenVentasByMonthByBusiness } = require('../controllers/productsold.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

router.post('/', verifyFirebaseToken, requireNegocioOwner('body'), requireRecursoOwner('products', 'idProducto', { from: 'body' }), createVenta);
router.get('/ventas/producto/:idProducto', verifyFirebaseToken, requireRecursoOwner('products', 'idProducto'), getProductosVendidosByProducto);
router.get('/ventas/producto/:idProducto/:year/:month', verifyFirebaseToken, requireRecursoOwner('products', 'idProducto'), getProductosVendidosByMonth);
router.get('/ventas/producto/resumen/:idProducto/:year/:month', verifyFirebaseToken, requireRecursoOwner('products', 'idProducto'), getResumenVentasByMonth);
router.get('/ventas/producto/negocio/:idNegocio/:year/:month', verifyFirebaseToken, requireNegocioOwner(), getResumenVentasByMonthByBusiness);

module.exports = router;