const jwt = require('jsonwebtoken');

function makeToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES || '7d'
    });
}
function ok(res, data) {
    res.json({ status: 200, message: 'success', data });
}
function bad(res, msg = 'bad_request') {
    res.status(400).json({ status: 400, message: msg, data: null });
}

module.exports = { makeToken, ok, bad };