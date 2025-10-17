// server/routes/pharmacistRoutes.js
const express = require('express');
const { 
  getAllPharmacists, 
  getPharmacistById,
  addPharmacist // Import the new function
} = require('../controllers/pharmacistController');

const router = express.Router();

router.get('/', getAllPharmacists);
router.get('/:id', getPharmacistById);

router.post('/', addPharmacist); // New route for creation

module.exports = router;