const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    type: {
        type: String,
        enum: ['Air Freight', 'Sea Freight', 'Road Freight'],
        required: true,
    },
    weight: { type: Number, required: true },
    estimatedCost: { type: Number },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Quote', QuoteSchema);
