const express = require('express');
const router = express.Router();
const { createUser, getUserById  } = require('../controllers/user.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

// Crear usuario (requiere token de Firebase)
router.post('/', verifyFirebaseToken, createUser);

// Obtener usuario por ID
router.get('/:id', verifyFirebaseToken, getUserById);

module.exports = router;
