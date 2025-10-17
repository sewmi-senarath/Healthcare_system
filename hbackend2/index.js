// server/index.js
const express = require('express');
const cors = require('cors');
// Import routes
const pharmacistRoutes = require('./routes/pharmacistRoutes'); 

const app = express();
const port = 3001; 

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.get('/', (req, res) => {
  res.send('Pharmacy Backend is running!');
});

// Use Pharmacist Routes
app.use('/api/pharmacists', pharmacistRoutes); // All pharmacist routes start with /api/pharmacists

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});