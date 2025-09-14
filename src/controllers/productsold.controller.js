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

// Obtener productos vendidos por ID de producto
async function getProductosVendidosByProducto(req, res) {
  try {
    const { idProducto } = req.params;

    if (!idProducto) {
      return res.status(400).json({ message: 'El idProducto es requerido' });
    }

    const snapshot = await admin.firestore()
      .collection('ventas') // 👈 ahora es la colección "ventas"
      .where('idProducto', '==', idProducto)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron ventas para este producto' });
    }

    const productosVendidos = snapshot.docs.map(doc => ({
      idVenta: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      message: `Ventas encontradas para el producto con ID ${idProducto}`,
      data: productosVendidos
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener ventas por ID de producto',
      error: error.message
    });
  }
}

// Obtener productos vendidos por producto en un mes específico
async function getProductosVendidosByMonth(req, res) {
  try {
    const { idProducto, year, month } = req.params;

    if (!idProducto || !year || !month) {
      return res.status(400).json({ message: 'idProducto, year y month son requeridos' });
    }

    // Parseamos año y mes a enteros
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10); // Enero = 1, Febrero = 2 ...

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ message: 'Mes o año inválidos' });
    }

    // Primer día del mes
    const startDate = new Date(yearInt, monthInt - 1, 1);
    // Último día del mes
    const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59);

    // Consulta en Firestore
    const snapshot = await admin.firestore()
      .collection('ventas') // 👈 usamos la colección de ventas
      .where('idProducto', '==', idProducto)
      .where('fechaVenta', '>=', startDate)
      .where('fechaVenta', '<=', endDate)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron ventas de este producto en ese mes' });
    }

    const productosVendidos = snapshot.docs.map(doc => ({
      idVenta: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({
      message: `Ventas del producto ${idProducto} en ${month}/${year}`,
      data: productosVendidos
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener ventas por mes',
      error: error.message
    });
  }
}

// Obtener resumen de ventas (cantidad total y valor total) de un producto en un mes específico
async function getResumenVentasByMonth(req, res) {
  try {
    const { idProducto, year, month } = req.params;

    if (!idProducto || !year || !month) {
      return res.status(400).json({ message: 'idProducto, year y month son requeridos' });
    }

    // Parseamos año y mes a enteros
    const yearInt = parseInt(year, 10);
    const monthInt = parseInt(month, 10);

    if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ message: 'Mes o año inválidos' });
    }

    // Rango de fechas del mes
    const startDate = new Date(yearInt, monthInt - 1, 1);
    const endDate = new Date(yearInt, monthInt, 0, 23, 59, 59);

    // Consulta en Firestore
    const snapshot = await admin.firestore()
      .collection('ventas')
      .where('idProducto', '==', idProducto)
      .where('fechaVenta', '>=', startDate)
      .where('fechaVenta', '<=', endDate)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No se encontraron ventas de este producto en ese mes' });
    }

    let totalCantidadVendida = 0;
    let totalVentas = 0;

    const productosVendidos = snapshot.docs.map(doc => {
      const data = doc.data();
      totalCantidadVendida += data.cantidadVendida || 0;
      totalVentas += data.totalVenta || (data.cantidadVendida * data.precioUnitario) || 0;

      return {
        idVenta: doc.id,
        ...data
      };
    });

    return res.status(200).json({
      message: `Resumen de ventas del producto ${idProducto} en ${month}/${year}`,
      totalCantidadVendida,
      totalVentas,
      data: productosVendidos
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener resumen de ventas por mes',
      error: error.message
    });
  }
}


module.exports = { createVenta, getProductosVendidosByProducto, getProductosVendidosByMonth, getResumenVentasByMonth };
