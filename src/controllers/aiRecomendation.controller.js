const admin = require('firebase-admin');
const RecomendacionIA = require('../models/aiRecomendation.model');

async function createRecomendacion(req, res) {
  try {
    const { idNegocio, tipo, mensaje } = req.body;

    const idRecomendacion = admin.firestore().collection('recomendaciones').doc().id;
    const newRecomendacion = new RecomendacionIA(idRecomendacion, idNegocio, tipo, mensaje);

    await admin.firestore().collection('recomendaciones').doc(idRecomendacion).set({
      idNegocio: newRecomendacion.idNegocio,
      tipo: newRecomendacion.tipo,
      mensaje: newRecomendacion.mensaje,
      fechaGeneracion: newRecomendacion.fechaGeneracion
    });

    return res.status(201).json({
      message: 'Recomendación creada con éxito',
      data: newRecomendacion
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear recomendación', error: error.message });
  }
}

module.exports = { createRecomendacion };
