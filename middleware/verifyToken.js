const jwt = require('jsonwebtoken');
const Blacklist = require('../models/blacklistModel');

const verifyToken = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token not provided' });

    // Check if token is blacklisted
    const isBlacklisted = await Blacklist.findOne({ token: token });
    if (isBlacklisted) {
        return res.status(401).json({ message: 'Token is no longer valid. Please log in again.' });
    }

    // Token not in blacklist, proceed with JWT verification
    jwt.verify(token, 'key', (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.userId;
        next();
    });
};

module.exports = verifyToken;
