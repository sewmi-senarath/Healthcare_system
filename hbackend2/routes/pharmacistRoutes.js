// server/routes/pharmacistRoutes.js
const express = require('express');
const { getAllPharmacists, getPharmacistById } = require('../controllers/pharmacistController');

const router = express.Router();

router.get('/', getAllPharmacists);
router.get('/:id', getPharmacistById);

module.exports = router;