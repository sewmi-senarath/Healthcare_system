// client/src/components/AddPharmacistForm.jsx
import React, { useState } from 'react';

function AddPharmacistForm({ onPharmacistAdded }) {
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [shift, setShift] = useState('Morning');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Adding pharmacist...');

    const newPharmacist = { name, licenseNumber, shift };

    try {
      const response = await fetch('/api/pharmacists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPharmacist),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add pharmacist.');
      }

      setMessage(`Success! Added ${data.pharmacist.name} with ID ${data.pharmacist.id}`);
      
      // Call the parent function to update the list
      onPharmacistAdded(data.pharmacist); 

      // Clear form
      setName('');
      setLicenseNumber('');

    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', marginBottom: '30px' }}>
      <h3>➕ Add New Pharmacist</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px' }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="License Number (e.g., PL1234)"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          required
        />
        <select value={shift} onChange={(e) => setShift(e.target.value)}>
          <option value="Morning">Morning</option>
          <option value="Evening">Evening</option>
        </select>
        <button type="submit">Add Pharmacist</button>
      </form>
      {message && <p style={{ marginTop: '10px', color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default AddPharmacistForm;