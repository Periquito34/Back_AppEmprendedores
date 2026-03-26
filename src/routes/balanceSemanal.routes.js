const express = require('express');
const router = express.Router();
const { createBalanceSemanal } = require('../controllers/balanceSemanal.controller');

router.post('/', createBalanceSemanal);

module.exports = router;