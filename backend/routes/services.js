const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Get all services
router.get('/', async (req, res) => {
    try {
        const { status, businessId } = req.query;
        let query = {};
        if (status) query.status = status;
        if (businessId) query.businessId = businessId;

        const services = await Service.find(query).populate('businessId', 'name email company');
        res.json(services);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new service (Business)
router.post('/', async (req, res) => {
    try {
        const { name, description, price, businessId } = req.body;
        const service = new Service({ name, description, price, businessId });
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update service status (Admin)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            { $set: { status } },
            { new: true }
        ).populate('businessId', 'name email company');
        
        if (!service) return res.status(404).json({ message: 'Service not found' });
        res.json(service);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
