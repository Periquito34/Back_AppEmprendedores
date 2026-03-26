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

async function getAllRecomendaciones(req, res) {
  try {
    const snapshot = await admin.firestore()
      .collection('recomendaciones')
      .orderBy('fechaGeneracion', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay recomendaciones',
        data: []
      });
    }

    const recomendaciones = [];

    snapshot.forEach(doc => {
      recomendaciones.push(doc.data());
    });

    return res.status(200).json({
      message: 'Recomendaciones obtenidas',
      total: recomendaciones.length,
      data: recomendaciones
    });

  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    return res.status(500).json({
      message: 'Error al obtener recomendaciones',
      error: error.message
    });
  }
}

async function getRecomendacionesByTipo(req, res) {
  try {
    const { tipo } = req.params;

    if (!tipo) {
      return res.status(400).json({
        message: 'tipo es requerido'
      });
    }

    const snapshot = await admin.firestore()
      .collection('recomendaciones')
      .where('tipo', '==', tipo)
      .orderBy('fechaGeneracion', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay recomendaciones de este tipo',
        data: []
      });
    }

    const recomendaciones = [];

    snapshot.forEach(doc => {
      recomendaciones.push(doc.data());
    });

    return res.status(200).json({
      message: 'Recomendaciones por tipo obtenidas',
      total: recomendaciones.length,
      data: recomendaciones
    });

  } catch (error) {
    console.error('Error al obtener recomendaciones por tipo:', error);
    return res.status(500).json({
      message: 'Error al obtener recomendaciones',
      error: error.message
    });
  }
}

async function getRecomendacionesByNegocio(req, res) {
  try {
    const { idNegocio } = req.params;

    if (!idNegocio) {
      return res.status(400).json({
        message: 'idNegocio es requerido'
      });
    }

    const snapshot = await admin.firestore()
      .collection('recomendaciones')
      .where('idNegocio', '==', idNegocio)
      .orderBy('fechaGeneracion', 'desc')
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay recomendaciones para este negocio',
        data: []
      });
    }

    const recomendaciones = [];

    snapshot.forEach(doc => {
      recomendaciones.push(doc.data());
    });

    return res.status(200).json({
      message: 'Recomendaciones del negocio obtenidas',
      total: recomendaciones.length,
      data: recomendaciones
    });

  } catch (error) {
    console.error('Error al obtener recomendaciones por negocio:', error);
    return res.status(500).json({
      message: 'Error al obtener recomendaciones',
      error: error.message
    });
  }
}

module.exports = { createRecomendacion, getAllRecomendaciones, getRecomendacionesByTipo, getRecomendacionesByNegocio };
