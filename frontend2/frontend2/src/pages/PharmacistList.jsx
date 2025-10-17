// client/src/pages/PharmacistList.jsx
import React, { useState, useEffect } from 'react';

function PharmacistList() {
  const [pharmacists, setPharmacists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from our Express backend using the /api proxy
    fetch('/api/pharmacists')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setPharmacists(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading Pharmacists...</div>;
  if (error) return <div>Error fetching data: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>💊 Pharmacist Management Dashboard</h2>
      <p>Total Pharmacists: **{pharmacists.length}**</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={tableHeaderStyle}>ID</th>
            <th style={tableHeaderStyle}>Name</th>
            <th style={tableHeaderStyle}>License No.</th>
            <th style={tableHeaderStyle}>Shift</th>
          </tr>
        </thead>
        <tbody>
          {pharmacists.map(p => (
            <tr key={p.id} style={tableRowStyle}>
              <td style={tableCellStyle}>{p.id}</td>
              <td style={tableCellStyle}>{p.name}</td>
              <td style={tableCellStyle}>{p.licenseNumber}</td>
              <td style={tableCellStyle}>{p.shift}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Basic inline styles for clarity
const tableHeaderStyle = { 
    padding: '10px', 
    border: '1px solid #ddd', 
    textAlign: 'left' 
};

const tableCellStyle = { 
    padding: '10px', 
    border: '1px solid #ddd' 
};

const tableRowStyle = { 
    transition: 'background-color 0.3s' 
};


export default PharmacistList;