const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.originalUrl}`);
    next();
});

// Serve uploaded profile images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/globalshipp';

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/services', require('./routes/services'));

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('GlobalShipp Backend is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
