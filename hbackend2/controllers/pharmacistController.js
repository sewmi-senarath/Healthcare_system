// server/controllers/pharmacistController.js
// NOTE: In a real app, this would interact with a database (e.g., Mongoose/MongoDB)
let pharmacists = require('../data/pharmacists.json'); // Use 'let' for in-memory modification

// ... existing code for getAllPharmacists and getPharmacistById ...

// @route   POST /api/pharmacists
// @desc    Add a new pharmacist
const addPharmacist = (req, res) => {
  const { name, licenseNumber, shift } = req.body;

  if (!name || !licenseNumber) {
    return res.status(400).json({ message: 'Missing required fields: name and licenseNumber' });
  }

  // Simple ID generation for the mock data
  const newId = `PH${String(pharmacists.length + 1).padStart(3, '0')}`; 
  
  const newPharmacist = {
    id: newId,
    name,
    licenseNumber,
    shift: shift || 'Unassigned' // Default shift if not provided
  };

  pharmacists.push(newPharmacist); // Update in-memory mock data

  res.status(201).json({ 
    message: 'Pharmacist added successfully', 
    pharmacist: newPharmacist 
  });
};

module.exports = {
  getAllPharmacists,
  getPharmacistById,
  addPharmacist, // Export the new function
};