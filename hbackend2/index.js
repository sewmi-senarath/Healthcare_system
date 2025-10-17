// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001; // Backend will run on port 3001

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Pharmacy Backend is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});