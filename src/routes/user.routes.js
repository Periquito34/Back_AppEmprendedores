const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/user.controller');
const verifyFirebaseToken = require('../middleware/firebaseAuth');

// Crear usuario (requiere token de Firebase)
router.post('/', verifyFirebaseToken, createUser);


module.exports = router;
