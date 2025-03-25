// index.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createHandler } = require('graphql-http/lib/use/express');
const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Single GraphQL endpoint
  app.use('/graphql', (req, res) => {
    let user = null;

    try {
      // Authenticate user if Authorization header is present
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          user = jwt.verify(token, process.env.SECRET);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }

    return createHandler({
      schema,
      context: { user }, // Pass user to resolvers
    })(req, res);
  });

  // Start server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});