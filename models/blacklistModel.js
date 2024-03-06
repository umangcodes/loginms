// blacklistModel.js
const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    timestamp: { type: String, required: true, unique: true },
    token: { type: String }
});

const Blacklist = mongoose.model('Blacklist', blacklistSchema);

module.exports = Blacklist;
