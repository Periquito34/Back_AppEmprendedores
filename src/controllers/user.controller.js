const admin = require('firebase-admin');
const User = require('../models/user.model');

async function createUser(req, res) {
  try {
    // uid obtenido del token verificado por verifyFirebaseToken
    const uid = req.user.uid;

    const { name, birthdate, numeroDeTelefono } = req.body;

    // Crear instancia de tu modelo
    const newUser = new User(uid, name, birthdate, numeroDeTelefono);

    // Guardar en Firestore (colección "users")
    await admin.firestore().collection('users').doc(uid).set({
      name: newUser.name,
      birthdate: newUser.birthdate,
      numeroDeTelefono: newUser.numeroDeTelefono,
      createdAt: newUser.createdAt
    });

    return res.status(201).json({
      message: 'Usuario creado con éxito',
      data: newUser
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error al crear usuario',
      error: error.message
    });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params; // el id lo pasas en la URL, ej: /users/:id

    const docRef = admin.firestore().collection('users').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const data = doc.data();

    // reconstruyo con el modelo si quieres mantener consistencia
    const user = new User(id, data.name, data.birthdate, data.numeroDeTelefono, data.createdAt);

    return res.status(200).json({
      message: 'Usuario encontrado',
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
}

async function getUserEmail(req, res) {
  try {
    const { uid } = req.params; // lo pasas por la URL: /users/:uid/email

    if (!uid) {
      return res.status(400).json({ message: 'Falta el uid en la URL' });
    }

    const userRecord = await admin.auth().getUser(uid);

    return res.status(200).json({
      message: 'Email obtenido con éxito',
      email: userRecord.email || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error al obtener email',
      error: error.message,
    });
  }
}

async function updateUserByUid(req, res) {
  try {
    const pathUid = (req.params.uid || '').trim();
    const requesterUid = req.user?.uid;
    const isAdmin = !!req.user?.claims?.admin; // custom claim "admin"

    if (!pathUid) {
      return res.status(400).json({ message: 'Falta :uid en la URL' });
    }

    // Seguridad: si no es admin, solo puede modificar su propio perfil
    if (!isAdmin && requesterUid !== pathUid) {
      return res.status(403).json({ message: 'No autorizado para modificar este usuario' });
    }

    const { name, birthdate, numeroDeTelefono } = req.body;
    const updates = {};

    if (typeof name !== 'undefined') updates.name = String(name).trim();
    if (typeof birthdate !== 'undefined') updates.birthdate = String(birthdate).trim();
    if (typeof numeroDeTelefono !== 'undefined') updates.numeroDeTelefono = String(numeroDeTelefono).trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No se proporcionaron campos válidos para actualizar (name, birthdate, numeroDeTelefono).'
      });
    }

    const docRef = admin.firestore().collection('users').doc(pathUid);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).json({ message: 'Perfil no encontrado. Crea el usuario primero.' });
    }

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await docRef.set(updates, { merge: true });

    const updated = await docRef.get();
    return res.status(200).json({
      message: 'Usuario actualizado con éxito',
      data: { uid: pathUid, ...updated.data() }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar usuario', error: error.message });
  }
}


module.exports = { createUser, getUserById, getUserEmail, updateUserByUid };