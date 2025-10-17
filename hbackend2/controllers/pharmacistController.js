// server/controllers/pharmacistController.js
const pharmacists = require('../data/pharmacists.json');

// @route   GET /api/pharmacists
// @desc    Get all pharmacists
const getAllPharmacists = (req, res) => {
  res.status(200).json(pharmacists);
};

// @route   GET /api/pharmacists/:id
// @desc    Get single pharmacist by ID
const getPharmacistById = (req, res) => {
  const pharmacist = pharmacists.find(p => p.id === req.params.id);
  if (pharmacist) {
    res.status(200).json(pharmacist);
  } else {
    res.status(404).json({ message: 'Pharmacist not found' });
  }
};

module.exports = {
  getAllPharmacists,
  getPharmacistById,
};