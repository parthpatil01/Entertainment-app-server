// index.js

const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;



// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all handler to send back the index.html for any route
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


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

