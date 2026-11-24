const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'business', 'admin'], default: 'customer' },
    profileImage: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    company: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
