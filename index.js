// app.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// MongoDB connection
mongoose.connect('mongodb+srv://umangaeng:adminU@cluster0.k7yyend.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'service_provider', 'admin'], required: true },
  blocked: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1]; // Splits 'Bearer <token>' and takes the token part
  if (!token) return res.status(401).json({ message: 'Token not provided' });

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token', err:err, req: req.headers });
    req.userId = decoded.userId;
    next();
  });
};

// Register User
app.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['client', 'service_provider', 'admin']),
], async (req, res) => {
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
});

// Login User
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

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

    const token = jwt.sign({ userId: user._id, role: user.role },"secret", { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout User
app.post('/logout', verifyToken, (req, res) => {
  // Perform any necessary actions related to logout
  res.json({ message: 'User logged out successfully' });
});

// Change Password
app.post('/change-password', verifyToken, async (req, res) => {
  const { newPassword } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.userId, { password: hashedPassword });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete User
app.delete('/users/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  try {
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/user/id', (req, res) => {
    // Extract the email parameter from the request URL
    const email  = req.body.email;

    // Query the MongoDB database to find the user with the corresponding email
    User.findOne({ email })
        .select('_id') // Select only the _id field
        .exec()
        .then(user => {
            if (!user) {
                // If user with the provided email is not found, return 404 Not Found
                return res.status(404).json({ message: 'User not found' });
            }
            // If user is found, return their ID in the response
            res.json({ userId: user._id });
        })
        .catch(err => {
            // Handle database query error
            console.error('Error finding user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        });
});

app.get('/heartbeat', verifyToken, (req, res) => {
    // If token is verified, user is logged in
    res.json({ loggedIn: true });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});