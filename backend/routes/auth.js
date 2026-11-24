const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password, role });
        // Note: In a real production app, password should be hashed with bcrypt here
        await user.save();

        res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name, email, role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Note: In a real app, compare hashed password using bcrypt.compare
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Note: In a real app, generate a JWT token here and send it back
        res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
