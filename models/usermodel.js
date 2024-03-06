const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['client', 'service_provider', 'admin'], required: true },
    blocked: { type: Boolean, default: false },
  });
  
const User = mongoose.model('User', userSchema);

module.exports = User