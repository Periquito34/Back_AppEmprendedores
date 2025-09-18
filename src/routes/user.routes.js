const express = require('express');
const router = express.Router();
const { createUser, getUserById, getUserEmail, updateUserByUid } = require('../controllers/user.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

// Crear usuario (requiere token de Firebase)
router.post('/', verifyFirebaseToken, createUser);

// Obtener usuario por ID
router.get('/:id', verifyFirebaseToken, getUserById);

// Obtener email del usuario autenticado
router.get('/:uid/email', verifyFirebaseToken, getUserEmail);

// Actualizar usuario por UID
router.put('/:uid', verifyFirebaseToken, updateUserByUid);

module.exports = router;
