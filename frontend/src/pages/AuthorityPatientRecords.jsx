import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import authorityAPI from '../utils/authorityAPI';
import { 
  DocumentTextIcon, 
  HeartIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AuthorityPatientRecords = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load patients list on component mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        
        // Try to load real patient data
        // First, try to get the specific patient you mentioned
        const specificPatient = await authorityAPI.getPatientById('PAT7813837WW');
        if (specificPatient.success) {
          setPatients([specificPatient.patient]);
          toast.success('Found patient PAT7813837WW');
        } else {
          // If specific patient not found, try to get all patients
          const allPatientsResult = await authorityAPI.getAllPatients();
          if (allPatientsResult.success && allPatientsResult.patients) {
            setPatients(allPatientsResult.patients);
          } else {
            toast.error('No patients found. Please check database connection.');
            setPatients([]);
          }
        }
      } catch (error) {
        console.error('Error loading patients:', error);
        toast.error('Failed to load patients. Please check database connection.');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    
    // Mock patient records data
    const mockRecords = [
      {
        id: '1',
        type: 'appointment',
        title: 'Routine Checkup',
        date: new Date('2024-01-15'),
        description: 'Regular health checkup and blood pressure monitoring',
        status: 'completed'
      },
      {
        id: '2',
        type: 'prescription',
        title: 'Blood Pressure Medication',
        date: new Date('2024-01-15'),
        description: 'Lisinopril 10mg, once daily for 30 days',
        status: 'active'
      },
      {
        id: '3',
        type: 'appointment',
        title: 'Follow-up Visit',
        date: new Date('2024-02-15'),
        description: 'Follow-up appointment to monitor medication effectiveness',
        status: 'scheduled'
      },
      {
        id: '4',
        type: 'prescription',
        title: 'Vitamin D Supplement',
        date: new Date('2024-02-15'),
        description: 'Vitamin D3 1000 IU, once daily',
        status: 'active'
      }
    ];
    
    setPatientRecords(mockRecords);
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'prescription':
        return <HeartIcon className="w-6 h-6 text-purple-600" />;
      case 'appointment':
        return <CalendarIcon className="w-6 h-6 text-blue-600" />;
      default:
        return <DocumentTextIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRoleTitle = (type) => {
    switch (type) {
      case 'doctor':
        return 'Doctor';
      case 'nurse':
        return 'Nurse';
      case 'pharmacist':
        return 'Pharmacist';
      case 'healthCareManager':
        return 'Healthcare Manager';
      case 'systemAdmin':
        return 'System Administrator';
      default:
        return 'Authority';
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {getRoleTitle(userType)}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient List</h2>
                
                {/* Search */}
                <div className="relative mb-4">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.patientId}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedPatient?.patientId === patient.patientId
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handlePatientSelect(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{patient.name}</h3>
                            <p className="text-sm text-gray-600">{patient.patientId}</p>
                            <p className="text-sm text-gray-500">{patient.email}</p>
                          </div>
                          <EyeIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Records */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Medical Records - {selectedPatient.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient ID: {selectedPatient.patientId} | DOB: {selectedPatient.dateOfBirth} | Gender: {selectedPatient.gender}
                  </p>
                </div>

                <div className="p-6">
                  {patientRecords.length > 0 ? (
                    <div className="space-y-4">
                      {patientRecords.map((record) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            {getRecordIcon(record.type)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">{record.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  record.status === 'completed' 
                                    ? 'bg-green-100 text-green-800'
                                    : record.status === 'active'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {record.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {record.date.toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No medical records found for this patient.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-12 text-center">
                  <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                  <p className="text-gray-600">
                    Choose a patient from the list to view their medical records and history.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthorityPatientRecords;
