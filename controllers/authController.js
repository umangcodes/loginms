const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/usermodel');
const Blacklist = require('../models/blacklistModel');



exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { email, password, role } = req.body;
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, role });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const email = username
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
  
      if (user.blocked) {
        return res.status(403).json({ message: 'User is blocked' });
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id, role: user.role },"key", { expiresIn: '1h' });
      res.status(200).json({ msg: "login success", token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
      return res.status(400).json({ message: 'Token not provided' });
  }
  try {
      await Blacklist.create({ token: token, timestamp: new Date().toISOString() });      // DO NOT REMOVE TIMESTAMP, WILL USE IT TO DO HOUSEKEEPING TASK OF DEBLACKLISTING. LESS MEMORY!
      res.status(200).json({ message: 'logout success' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res) => {
    const { newPassword } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(req.userId, { password: hashedPassword });
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};
