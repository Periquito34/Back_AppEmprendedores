const { db } = require('../config/firebase');

// Devuelve el documento del negocio si pertenece al usuario.
// { status: 404 } si no existe, { status: 403 } si es de otro usuario.
async function verificarNegocioDelUsuario(idNegocio, uid) {
  if (!idNegocio) return { status: 400, message: 'idNegocio es requerido' };

  const negocioDoc = await db.collection('businesses').doc(idNegocio).get();
  if (!negocioDoc.exists) return { status: 404, message: 'Negocio no encontrado' };
  if (negocioDoc.data().uid !== uid) return { status: 403, message: 'No tienes permisos sobre este negocio' };

  return { status: 200, negocio: negocioDoc.data() };
}

module.exports = { verificarNegocioDelUsuario };
