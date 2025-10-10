const express = require('express');
const { User, Product, Order } = require('./models');
const { auth, adminOnly } = require('./middleware');
const { makeToken, ok, bad } = require('./utils');

const router = express.Router();

router.get('/', (req, res) => res.json({ status: 'ok', service: 'simple-order-api' }));

//register
router.post('/api/v1/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name || !email || !password) return bad(res, 'missing_fields');
        const exists = await User.findOne({ email });
        if (exists) return bad(res, 'email_exists');
        const user = await User.create({ name, email, password });
        const token = makeToken(user);
        res.status(201).json({
            status: 201,
            message: 'registered',
            data: { user: { _id: user._id, name, email, role: user.role, isApproved: user.isApproved }, token }
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: 500, message: 'server_error', data: null });
    }
});

//login
router.post('/api/v1/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ status: 401, message: 'invalid_credentials', data: null });
        const okPass = await user.checkPass(password || '');
        if (!okPass) return res.status(401).json({ status: 401, message: 'invalid_credentials', data: null });
        const token = makeToken(user);
        ok(res, {
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved },
            token,
            isApproved: user.isApproved
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ status: 500, message: 'server_error', data: null });
    }
});

// Approve user
router.put('/api/v1/users/:id/approve', auth, adminOnly, async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    if (!user) return res.status(404).json({ status: 404, message: 'user_not_found', data: null });
    ok(res, { user: { _id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved } });
});

//products
router.get('/api/v1/products', async (req, res) => {
    const list = await Product.find({ isActive: true }).sort('-createdAt');
    ok(res, list);
});
router.get('/api/v1/products/:id', async (req, res) => {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ status: 404, message: 'product_not_found', data: null });
    ok(res, p);
});
router.post('/api/v1/products', auth, adminOnly, async (req, res) => {
    const { name, price, stock } = req.body || {};
    if (!name || price == null || stock == null) return bad(res, 'missing_fields');
    const p = await Product.create({ name, price, stock });
    res.status(201).json({ status: 201, message: 'created', data: p });
});
router.put('/api/v1/products/:id', auth, adminOnly, async (req, res) => {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ status: 404, message: 'product_not_found', data: null });
    ok(res, p);
});
router.delete('/api/v1/products/:id', auth, adminOnly, async (req, res) => {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ status: 404, message: 'product_not_found', data: null });
    ok(res, p);
});

//orders
router.post('/api/v1/products/:id/orders', auth, async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ status: 404, message: 'product_not_found', data: null });
    const qty = Number(req.body?.quantity || 0);
    if (!qty || qty < 1) return bad(res, 'bad_quantity');
    if (qty > product.stock) return bad(res, 'insufficient_stock');
    product.stock = product.stock - qty;
    await product.save();
    const order = await Order.create({
        product: product._id,
        user: req.user._id,
        quantity: qty,
        totalPrice: product.price * qty
    });
    res.status(201).json({ status: 201, message: 'order_created', data: order });
});
router.get('/api/v1/products/:id/orders', auth, async (req, res) => {
    const filter = { product: req.params.id, user: req.user._id };
    const orders = await Order.find(filter).populate('product', 'name price');
    ok(res, orders);
});
router.get('/api/v1/orders', auth, async (req, res) => {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const orders = await Order.find(filter).populate('product', 'name price').populate('user', 'name email');
    ok(res, orders);
});

router.use((req, res) => res.status(404).json({ status: 404, message: `Not Found - ${req.path}`, data: null }));

module.exports = router;