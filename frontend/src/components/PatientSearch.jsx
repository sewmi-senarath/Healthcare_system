import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  QrCodeIcon, 
  UserIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import patientAPI from '../utils/patientAPI';
import toast from 'react-hot-toast';

const PatientSearch = ({ onPatientSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showScanCard, setShowScanCard] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Static card scanning simulation
  const handleCardScan = () => {
    setShowScanCard(true);
    setLoading(true);
    
    // Simulate card scanning process
    setTimeout(() => {
      const mockCardData = {
        patientId: 'PAT7813837WW',
        name: 'John Doe',
        age: 35,
        phone: '+1234567890',
        email: 'john.doe@email.com',
        medicalRecord: 'MR-2024-001',
        lastVisit: '2024-10-15',
        status: 'active'
      };
      
      setScanResult(mockCardData);
      setLoading(false);
      toast.success('Card scanned successfully!');
    }, 2000);
  };

  // Dynamic patient search by ID
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a patient ID');
      return;
    }

    setLoading(true);
    try {
      // Search for patient by ID
      const response = await patientAPI.searchPatientById(searchQuery.trim());
      
      if (response.success && response.patient) {
        setSearchResults([response.patient]);
        toast.success('Patient found!');
      } else {
        setSearchResults([]);
        toast.error('Patient not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search patient');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    onPatientSelect(patient);
    onClose();
  };

  const handleScanConfirm = () => {
    if (scanResult) {
      handlePatientSelect(scanResult);
    }
  };

  const handleScanCancel = () => {
    setShowScanCard(false);
    setScanResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Patient Search</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Card Scanning Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <QrCodeIcon className="w-5 h-5 mr-2 text-blue-600" />
              Card Scanning
            </h3>
            
            {!showScanCard ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-dashed border-blue-200">
                <div className="text-center">
                  <QrCodeIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Scan Patient Card</h4>
                  <p className="text-gray-600 mb-4">
                    Place the patient's card in front of the scanner to automatically retrieve patient information.
                  </p>
                  <button
                    onClick={handleCardScan}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
                  >
                    <QrCodeIcon className="w-5 h-5 mr-2" />
                    Start Scanning
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Scanning card...</p>
                  </div>
                ) : scanResult ? (
                  <div className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center mb-4">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
                      <h4 className="text-lg font-medium text-gray-900">Card Scanned Successfully</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Patient ID</label>
                        <p className="text-gray-900">{scanResult.patientId}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-gray-900">{scanResult.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Age</label>
                        <p className="text-gray-900">{scanResult.age}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{scanResult.phone}</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleScanConfirm}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Select Patient
                      </button>
                      <button
                        onClick={handleScanCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Manual Search Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-green-600" />
              Manual Search
            </h3>
            
            <div className="flex space-x-3 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Patient ID (e.g., PAT7813837WW)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Search Results:</h4>
                {searchResults.map((patient, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserIcon className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                          <h5 className="font-medium text-gray-900">{patient.name}</h5>
                          <p className="text-sm text-gray-500">ID: {patient.patientId}</p>
                          <p className="text-sm text-gray-500">Phone: {patient.phone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePatientSelect(patient)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !loading && (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No patients found with the given ID</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSearch;
