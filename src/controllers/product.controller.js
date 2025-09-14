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

// 🔹 Nuevo método para disminuir stock
async function decreaseStock(req, res) {
  try {
    const { idProducto, cantidad } = req.body;

    if (!idProducto || !cantidad) {
      return res.status(400).json({ message: 'idProducto y cantidad son requeridos' });
    }

    const productRef = admin.firestore().collection('products').doc(idProducto);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const productData = productDoc.data();

    if (productData.stock < cantidad) {
      return res.status(400).json({ message: 'Stock insuficiente para realizar la operación' });
    }

    // Restar stock
    await productRef.update({
      stock: productData.stock - cantidad
    });

    return res.status(200).json({
      message: `Se descontaron ${cantidad} unidades del producto`,
      nuevoStock: productData.stock - cantidad
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error al disminuir stock', error: error.message });
  }
}

// Obtener productos por negocio
async function getProductsByBusiness(req, res) {
  try {
    const { idNegocio } = req.params;

    if (!idNegocio) {
      return res.status(400).json({ message: 'El idNegocio es requerido' });
    }

    const snapshot = await admin.firestore()
      .collection('products')
      .where('idNegocio', '==', idNegocio)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron productos para este negocio' });
    }

    const products = snapshot.docs.map(doc => ({
      idProducto: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      message: `Productos del negocio ${idNegocio}`,
      data: products
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
}

module.exports = { createProduct, decreaseStock, getProductsByBusiness };