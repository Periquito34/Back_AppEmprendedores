const { db } = require('../config/firebase');
const { verificarNegocioDelUsuario } = require('../utils/negocioOwnership');

// Middlewares de autorizacion. Van despues de verifyFirebaseToken (necesitan req.user.uid).

// El negocio (de la URL o del body) debe pertenecer al usuario autenticado.
// Deja el negocio en req.negocio.
function requireNegocioOwner(from = 'params') {
  return async (req, res, next) => {
    try {
      const idNegocio = from === 'body' ? req.body?.idNegocio : req.params.idNegocio;
      const permiso = await verificarNegocioDelUsuario(idNegocio, req.user?.uid);
      if (permiso.status !== 200) {
        return res.status(permiso.status).json({ message: permiso.message });
      }
      req.negocio = permiso.negocio;
      return next();
    } catch (error) {
      console.error('Error verificando permisos del negocio:', error);
      return res.status(500).json({ message: 'Error verificando permisos' });
    }
  };
}

// Un recurso (producto, gasto fijo, balance...) cuyo documento tiene idNegocio:
// debe pertenecer a un negocio del usuario. Si la peticion trae idNegocio en el body,
// el recurso tiene que ser de ese mismo negocio. Deja el documento en req.recurso.
function requireRecursoOwner(collection, idField, { from = 'params' } = {}) {
  return async (req, res, next) => {
    try {
      const id = from === 'body' ? req.body?.[idField] : req.params[idField];
      if (!id) {
        return res.status(400).json({ message: `${idField} es requerido` });
      }

      const doc = await db.collection(collection).doc(String(id)).get();
      if (!doc.exists) {
        return res.status(404).json({ message: 'Recurso no encontrado' });
      }

      const idNegocio = doc.data().idNegocio;
      const permiso = await verificarNegocioDelUsuario(idNegocio, req.user?.uid);
      if (permiso.status !== 200) {
        // Un recurso huerfano o de otro usuario se trata igual: sin permiso
        return res.status(403).json({ message: 'No tienes permisos sobre este recurso' });
      }

      if (req.body?.idNegocio && req.body.idNegocio !== idNegocio) {
        return res.status(400).json({ message: 'El recurso no pertenece al negocio indicado' });
      }

      req.recurso = { id: doc.id, ...doc.data() };
      return next();
    } catch (error) {
      console.error('Error verificando permisos del recurso:', error);
      return res.status(500).json({ message: 'Error verificando permisos' });
    }
  };
}

// El :uid de la URL debe ser el del usuario autenticado
function requireSameUser(paramName = 'uid') {
  return (req, res, next) => {
    if (req.params[paramName] !== req.user?.uid) {
      return res.status(403).json({ message: 'No tienes permisos sobre este usuario' });
    }
    return next();
  };
}

// Ids de los negocios del usuario, para filtrar los listados generales
async function negociosDelUsuario(uid) {
  const snap = await db.collection('businesses').where('uid', '==', uid).get();
  return snap.docs.map((doc) => doc.id);
}

// Documentos de una coleccion que pertenecen a los negocios del usuario
async function docsDeNegociosDelUsuario(collection, uid, extraFilter) {
  const ids = await negociosDelUsuario(uid);
  const docs = [];
  for (let i = 0; i < ids.length; i += 30) { // limite de Firestore para 'in'
    let query = db.collection(collection).where('idNegocio', 'in', ids.slice(i, i + 30));
    if (extraFilter) query = query.where(extraFilter.field, '==', extraFilter.value);
    const snap = await query.get();
    docs.push(...snap.docs);
  }
  return docs;
}

module.exports = {
  requireNegocioOwner,
  requireRecursoOwner,
  requireSameUser,
  negociosDelUsuario,
  docsDeNegociosDelUsuario
};
