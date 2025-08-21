const admin = require('firebase-admin');
const Transaccion = require('../models/transaction.model');

async function createTransaccion(req, res) {
  try {
    const { idNegocio, tipo, monto, descripcion } = req.body;

    const idTransaccion = admin.firestore().collection('transacciones').doc().id;
    const newTransaccion = new Transaccion(idTransaccion, idNegocio, tipo, monto, descripcion);

    await admin.firestore().collection('transacciones').doc(idTransaccion).set({
      idNegocio: newTransaccion.idNegocio,
      tipo: newTransaccion.tipo,
      monto: newTransaccion.monto,
      descripcion: newTransaccion.descripcion,
      fecha: newTransaccion.fecha
    });

    return res.status(201).json({
      message: 'Transacción registrada con éxito',
      data: newTransaccion
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar transacción', error: error.message });
  }
}

module.exports = { createTransaccion };
