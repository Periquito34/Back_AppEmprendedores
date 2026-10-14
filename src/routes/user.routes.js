const express = require('express');
const router = express.Router();
const { createUser, getUserById, getUserEmail, updateUserByUid } = require('../controllers/user.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');
const { requireNegocioOwner, requireRecursoOwner, requireSameUser } = require('../middleware/ownership');

// Crear usuario (requiere token de Firebase)
router.post('/', verifyFirebaseToken, createUser);

// Obtener usuario por ID
router.get('/:id', verifyFirebaseToken, requireSameUser('id'), getUserById);

// Obtener email del usuario autenticado
router.get('/:uid/email', verifyFirebaseToken, requireSameUser('uid'), getUserEmail);

// Actualizar usuario por UID
router.put('/:uid', verifyFirebaseToken, requireSameUser('uid'), updateUserByUid);

module.exports = router;
