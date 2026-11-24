const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');

// Get all shipments (Admin/Business)
router.get('/', async (req, res) => {
    try {
        const shipments = await Shipment.find().populate('customer', 'name email');
        res.json(shipments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get shipments for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const shipments = await Shipment.find({ customer: req.params.userId });
        res.json(shipments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new shipment
router.post('/', async (req, res) => {
    try {
        const { customerId, origin, destination, type, weight, dimensions, estimatedCost, estimatedDelivery } = req.body;
        
        // Generate a random tracking ID (e.g., GS + 9 random digits)
        const trackingId = 'GS' + Math.floor(100000000 + Math.random() * 900000000);

        const newShipment = new Shipment({
            trackingId,
            customer: customerId,
            origin,
            destination,
            type,
            weight,
            dimensions,
            estimatedCost,
            estimatedDelivery
        });

        const shipment = await newShipment.save();
        res.status(201).json(shipment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update shipment status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const shipment = await Shipment.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        );

        if (!shipment) return res.status(404).json({ message: 'Shipment not found' });
        
        res.json(shipment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
