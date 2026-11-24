const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
    trackingId: {
        type: String,
        required: true,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    origin: {
        type: String,
        required: true,
    },
    destination: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Air Freight', 'Sea Freight', 'Road Freight'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Booked', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered', 'Pending'],
        default: 'Booked',
    },
    weight: {
        type: Number,
        required: true,
    },
    dimensions: {
        type: String,
    },
    estimatedCost: {
        type: Number,
    },
    estimatedDelivery: {
        type: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', ShipmentSchema);
