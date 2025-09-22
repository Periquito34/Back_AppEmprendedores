const admin = require('firebase-admin');
const Business = require('../models/business.model');

/*async function createBusiness(req, res) {
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
*/
async function createBusiness(req, res) {
  try {
    const uid = req.user?.uid; // viene de tu middleware verifyFirebaseToken
    if (!uid) return res.status(401).json({ message: 'No autenticado' });

    // ⬇️ Incluye 'descripcion' desde el body (puede ser opcional)
    const { nombreNegocio, descripcion = '', sector, capitalInicial } = req.body;

    // Validaciones básicas
    if (!nombreNegocio || !sector || capitalInicial === undefined) {
      return res.status(400).json({ message: 'Faltan campos: nombreNegocio, sector, capitalInicial' });
    }
    const capital = Number(capitalInicial);
    if (!Number.isFinite(capital) || capital < 0) {
      return res.status(400).json({ message: 'capitalInicial debe ser un número válido >= 0' });
    }

    // Generar ID del documento
    const docRef = admin.firestore().collection('businesses').doc();
    const idNegocio = docRef.id;

    // OJO: tu clase Business debe aceptar 'descripcion' en el constructor
    // constructor(idNegocio, uid, nombreNegocio, descripcion, sector, capitalInicial)
    const newBusiness = new Business(
      idNegocio,
      uid,
      nombreNegocio,
      descripcion,
      sector,
      capital
    );

    await docRef.set({
      uid: newBusiness.uid,
      nombreNegocio: newBusiness.nombreNegocio,
      descripcion: newBusiness.descripcion,
      sector: newBusiness.sector,
      capitalInicial: newBusiness.capitalInicial,
      // Mejor usar timestamp del servidor
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.status(201).json({
      message: 'Negocio creado con éxito',
      data: newBusiness
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear negocio', error: error.message });
  }
}


async function getBusinessByUserId(req, res) {
  try {
    const { uid } = req.params; // viene desde la URL

    if (!uid) {
      return res.status(400).json({ message: 'Falta el uid en la URL' });
    }

    // consulta en la colección "businesses" filtrando por uid
    const snapshot = await admin
      .firestore()
      .collection('businesses')
      .where('uid', '==', uid)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        message: 'No se encontraron negocios para este usuario',
      });
    }

    const businesses = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      businesses.push(
        new Business(
          doc.id,
          data.uid,
          data.nombreNegocio,
          data.descripcion,
          data.sector,
          data.capitalInicial,
        )
      );
    });

    return res.status(200).json({
      message: 'Negocios obtenidos con éxito',
      data: businesses,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener negocios por usuario',
      error: error.message,
    });
  }
}

// PUT - Actualizar negocio
async function updateBusiness(req, res) {
  try {
    const uid = req.user?.uid; // viene del middleware verifyFirebaseToken
    if (!uid) return res.status(401).json({ message: 'No autenticado' });

    const { idNegocio } = req.params; // ID del negocio en la URL
    const { nombreNegocio, descripcion, sector, capitalInicial } = req.body;

    const negocioRef = admin.firestore().collection('businesses').doc(idNegocio);
    const doc = await negocioRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Negocio no encontrado' });
    }

    // Validar que el negocio pertenece al usuario autenticado
    if (doc.data().uid !== uid) {
      return res.status(403).json({ message: 'No tienes permisos para modificar este negocio' });
    }

    // Construir objeto con los datos que se pueden actualizar
    const updatedData = {};
    if (nombreNegocio !== undefined) updatedData.nombreNegocio = nombreNegocio;
    if (descripcion !== undefined) updatedData.descripcion = descripcion;
    if (sector !== undefined) updatedData.sector = sector;
    if (capitalInicial !== undefined) {
      const capital = Number(capitalInicial);
      if (!Number.isFinite(capital) || capital < 0) {
        return res.status(400).json({ message: 'capitalInicial debe ser un número válido >= 0' });
      }
      updatedData.capitalInicial = capital;
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: 'No se enviaron campos para actualizar' });
    }

    await negocioRef.update(updatedData);

    return res.status(200).json({
      message: 'Negocio actualizado con éxito',
      data: { idNegocio, ...updatedData }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar negocio', error: error.message });
  }
}

module.exports = { createBusiness, getBusinessByUserId, updateBusiness };
