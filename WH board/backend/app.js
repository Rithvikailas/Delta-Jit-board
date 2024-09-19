const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/jit', require('./routes/jitRoutes'));


app.get('/api/jit/all', async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 5; // Default to 5 records per page

      const skip = (page - 1) * limit;
      const totalItems = await JITModel.countDocuments(); // Get total number of items
      const totalPages = Math.ceil(totalItems / limit); // Calculate total pages

      const jitData = await JITModel.find().skip(skip).limit(limit); // Get paginated data

      res.json({
          data: jitData,
          totalPages,
          currentPage: page
      });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});


// Connect to MongoDB
const mongoURI = process.env.MONGODB;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
