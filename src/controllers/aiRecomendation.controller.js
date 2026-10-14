const admin = require('firebase-admin');
const { docsDeNegociosDelUsuario } = require('../middleware/ownership');
const { sortByDateDesc } = require('../utils/sortByDate');
const { verificarNegocioDelUsuario } = require('../utils/negocioOwnership');
const RecomendacionIA = require('../models/aiRecomendation.model');
const { ESTADOS_RECOMENDACION } = require('../models/aiRecomendation.model');

// Los documentos antiguos no guardaban el id ni el estado
function mapRecomendacion(doc) {
  const data = doc.data();
  return {
    ...data,
    idRecomendacion: data.idRecomendacion || doc.id,
    estado: data.estado || 'pendiente'
  };
}

async function createRecomendacion(req, res) {
  try {
    const { idNegocio, tipo, mensaje, titulo, prioridad, impacto } = req.body;

    if (!mensaje || !String(mensaje).trim()) {
      return res.status(400).json({ message: 'mensaje es requerido' });
    }

    const permiso = await verificarNegocioDelUsuario(idNegocio, req.user?.uid);
    if (permiso.status !== 200) {
      return res.status(permiso.status).json({ message: permiso.message });
    }

    const idRecomendacion = admin.firestore().collection('recomendaciones').doc().id;
    const newRecomendacion = new RecomendacionIA(idRecomendacion, idNegocio, tipo, mensaje, { titulo, prioridad, impacto });

    await admin.firestore().collection('recomendaciones').doc(idRecomendacion).set({ ...newRecomendacion });

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
    const docs = await docsDeNegociosDelUsuario('recomendaciones', req.user.uid);
    const recomendaciones = sortByDateDesc(docs.map(mapRecomendacion), 'fechaGeneracion');

    return res.status(200).json({
      message: recomendaciones.length ? 'Recomendaciones obtenidas' : 'No hay recomendaciones',
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

    const docs = await docsDeNegociosDelUsuario('recomendaciones', req.user.uid, { field: 'tipo', value: tipo });
    const recomendaciones = docs.map(mapRecomendacion);

    return res.status(200).json({
      message: 'Recomendaciones por tipo obtenidas',
      total: recomendaciones.length,
      data: sortByDateDesc(recomendaciones, 'fechaGeneracion')
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

    const permiso = await verificarNegocioDelUsuario(idNegocio, req.user?.uid);
    if (permiso.status !== 200) {
      return res.status(permiso.status).json({ message: permiso.message });
    }

    const snapshot = await admin.firestore()
      .collection('recomendaciones')
      .where('idNegocio', '==', idNegocio)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({
        message: 'No hay recomendaciones para este negocio',
        data: []
      });
    }

    const recomendaciones = snapshot.docs.map(mapRecomendacion);

    return res.status(200).json({
      message: 'Recomendaciones del negocio obtenidas',
      total: recomendaciones.length,
      data: sortByDateDesc(recomendaciones, 'fechaGeneracion')
    });

  } catch (error) {
    console.error('Error al obtener recomendaciones por negocio:', error);
    return res.status(500).json({
      message: 'Error al obtener recomendaciones',
      error: error.message
    });
  }
}

// PATCH - Marcar una recomendacion como pendiente / aplicada / descartada
async function updateEstadoRecomendacion(req, res) {
  try {
    const { idRecomendacion } = req.params;
    const { estado } = req.body;

    if (!ESTADOS_RECOMENDACION.includes(estado)) {
      return res.status(400).json({ message: `estado debe ser uno de: ${ESTADOS_RECOMENDACION.join(', ')}` });
    }

    const ref = admin.firestore().collection('recomendaciones').doc(idRecomendacion);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Recomendación no encontrada' });
    }

    const permiso = await verificarNegocioDelUsuario(doc.data().idNegocio, req.user?.uid);
    if (permiso.status !== 200) {
      return res.status(permiso.status === 404 ? 403 : permiso.status).json({ message: permiso.message });
    }

    await ref.update({ estado, fechaEstado: new Date() });

    return res.status(200).json({
      message: 'Estado actualizado',
      data: { ...mapRecomendacion(doc), estado }
    });
  } catch (error) {
    console.error('Error al actualizar estado de recomendación:', error);
    return res.status(500).json({ message: 'Error al actualizar recomendación', error: error.message });
  }
}

module.exports = {
  createRecomendacion,
  getAllRecomendaciones,
  getRecomendacionesByTipo,
  getRecomendacionesByNegocio,
  updateEstadoRecomendacion
};
