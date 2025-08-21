const admin = require('firebase-admin');
const ProductoVendido = require('../models/productSold.model');

async function createVenta(req, res) {
  try {
    const { idProducto, cantidadVendida, precioUnitario } = req.body;

    const idVenta = admin.firestore().collection('ventas').doc().id;
    const newVenta = new ProductoVendido(idVenta, idProducto, cantidadVendida, precioUnitario);

    await admin.firestore().collection('ventas').doc(idVenta).set({
      idProducto: newVenta.idProducto,
      cantidadVendida: newVenta.cantidadVendida,
      precioUnitario: newVenta.precioUnitario,
      totalVenta: newVenta.totalVenta,
      fechaVenta: newVenta.fechaVenta
    });

    return res.status(201).json({
      message: 'Venta registrada con éxito',
      data: newVenta
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar venta', error: error.message });
  }
}

module.exports = { createVenta };
