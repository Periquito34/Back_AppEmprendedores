const admin = require('firebase-admin');
const User = require('../models/user.model');

async function createUser(req, res) {
  try {
    // uid obtenido del token verificado por verifyFirebaseToken
    const uid = req.user.uid;

    const { name, birthdate } = req.body;

    // Crear instancia de tu modelo
    const newUser = new User(uid, name, birthdate);

    // Guardar en Firestore (colección "users")
    await admin.firestore().collection('users').doc(uid).set({
      name: newUser.name,
      birthdate: newUser.birthdate,
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
    const user = new User(id, data.name, data.birthdate, data.createdAt);

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

module.exports = { createUser, getUserById };
