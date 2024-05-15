// index.js

const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use("/api/data", require('./src/routes/dataRoutes'))
app.use("/api/media", require('./src/routes/mediaRoutes'))
app.use("/api/user", require('./src/routes/userRoutes'))




// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.on('connected', async () => {

    console.log('Connected to MongoDB');

    // Start server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});


axios.interceptors.response.use(response => {
    return response;
}, error => {
    throw error; // Re-throw the error to be caught by the catch blocks
});