// app.js
const express = require('express');
const cors = require('cors');
const connectDb = require("./database/config.js")
// const { connectRedis } = require("./database/redis.js");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const verifyToken = require("./middleware/verifyToken.js")
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('dotenv').config()
app.use(cors(
  {
    origin: 'http://localhost:3001',
    credentials: true
  }
));
connectDb()
// connectRedis();
// Login User
app.use(authRoutes);
app.use(userRoutes);

app.get('/heartbeat', verifyToken, (req, res) => {
    // If token is verified, user is logged in
    res.json({ loggedIn: true });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});