const jwt = require('jsonwebtoken');
const { User } = require('./models');

async function auth(req, res, next) {
    try {
        const h = req.headers.authorization || '';
        const token = h.startsWith('Bearer ') ? h.slice(7) : null;
        if (!token) return res.status(401).json({ status: 401, message: 'no_token', data: null });
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ status: 401, message: 'user_not_found', data: null });
        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ status: 401, message: 'invalid_token', data: null });
    }
}

function adminOnly(req, res, next) {
    if (req.user?.role !== 'admin') return res.status(403).json({ status: 403, message: 'admin_only', data: null });
    next();
}

module.exports = { auth, adminOnly };