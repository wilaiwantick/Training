const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema(
    {
        name: String,
        email: { type: String, unique: true },
        password: String,
        role: { type: String, default: 'user' },
        isApproved: { type: Boolean, default: false }
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
userSchema.methods.checkPass = function (plain) {
    return bcrypt.compare(plain, this.password);
};


const productSchema = new mongoose.Schema(
    { name: String, price: Number, stock: Number, isActive: { default: true, type: Boolean } },
    { timestamps: true }
);


const orderSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        quantity: Number,
        totalPrice: Number
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { User, Product, Order };