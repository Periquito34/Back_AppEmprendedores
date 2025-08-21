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

module.exports = { createUser };
