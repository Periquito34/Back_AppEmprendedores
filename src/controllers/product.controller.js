const admin = require('firebase-admin');
const Product = require('../models/product.model');

async function createProduct(req, res) {
  try {
    const { idNegocio, nombreProducto, precioVenta, costoProduccion, stock } = req.body;

    const idProducto = admin.firestore().collection('products').doc().id;
    const newProduct = new Product(idProducto, idNegocio, nombreProducto, precioVenta, costoProduccion, stock);

    await admin.firestore().collection('products').doc(idProducto).set({
      idNegocio: newProduct.idNegocio,
      nombreProducto: newProduct.nombreProducto,
      precioVenta: newProduct.precioVenta,
      costoProduccion: newProduct.costoProduccion,
      stock: newProduct.stock
    });

    return res.status(201).json({
      message: 'Producto creado con éxito',
      data: newProduct
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
}

module.exports = { createProduct };
