const admin = require('firebase-admin');
const Business = require('../models/business.model');

async function createBusiness(req, res) {
  try {
    const { nombreNegocio, sector, capitalInicial } = req.body;
    const uid = req.user.uid; // usuario autenticado

    const idNegocio = admin.firestore().collection('businesses').doc().id;
    const newBusiness = new Business(idNegocio, uid, nombreNegocio, descripcion, sector, capitalInicial);

    await admin.firestore().collection('businesses').doc(idNegocio).set({
      uid: newBusiness.uid,
      nombreNegocio: newBusiness.nombreNegocio,
      descripcion: newBusiness.descripcion,
      sector: newBusiness.sector,
      capitalInicial: newBusiness.capitalInicial,
      fechaCreacion: newBusiness.fechaCreacion
    });

    return res.status(201).json({
      message: 'Negocio creado con éxito',
      data: newBusiness
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear negocio', error: error.message });
  }
}
    
module.exports = { createBusiness };
