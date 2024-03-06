const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/verifyToken');

router.delete('/users/:userId', verifyToken, userController.deleteUser);

router.get('/user/id', userController.getUserById);

module.exports = router;
