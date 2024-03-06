const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['client', 'service_provider', 'admin']),
], authController.register);

router.post('/login', authController.login);

router.post('/logout', verifyToken, authController.logout);

router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
