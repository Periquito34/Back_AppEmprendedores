const admin = require('firebase-admin');
const HistorialRentabilidad = require('../models/historialRentabilidad.model');

async function createHistorial(req, res) {
  try {
    const { idNegocio, rentabilidadEsperada, rentabilidadReal, periodo } = req.body;

    const idHistorial = admin.firestore().collection('historialRentabilidad').doc().id;
    const newHistorial = new HistorialRentabilidad(idHistorial, idNegocio, rentabilidadEsperada, rentabilidadReal, periodo);

    await admin.firestore().collection('historialRentabilidad').doc(idHistorial).set({
      idNegocio: newHistorial.idNegocio,
      rentabilidadEsperada: newHistorial.rentabilidadEsperada,
      rentabilidadReal: newHistorial.rentabilidadReal,
      periodo: newHistorial.periodo
    });

    return res.status(201).json({
      message: 'Historial de rentabilidad registrado con éxito',
      data: newHistorial
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear historial de rentabilidad', error: error.message });
  }
}

module.exports = { createHistorial };
