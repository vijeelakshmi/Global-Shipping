const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');

// Get all quotes (Admin/Business)
router.get('/', async (req, res) => {
    try {
        const quotes = await Quote.find().populate('customer', 'name email');
        res.json(quotes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get quotes for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const quotes = await Quote.find({ customer: req.params.userId });
        res.json(quotes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Create a new quote request
router.post('/', async (req, res) => {
    try {
        const { customerId, origin, destination, type, weight, notes } = req.body;
        const estimatedCost = weight * (type === 'Air Freight' ? 2.5 : type === 'Sea Freight' ? 0.8 : 1.2);
        const quote = new Quote({ customer: customerId, origin, destination, type, weight, estimatedCost, notes });
        await quote.save();
        res.status(201).json(quote);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update quote status (Admin)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const quote = await Quote.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
        if (!quote) return res.status(404).json({ message: 'Quote not found' });
        res.json(quote);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
