import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  DocumentTextIcon, 
  HeartIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import patientAPI from '../utils/patientAPI';

const MedicalRecords = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load medical records on component mount
  useEffect(() => {
    const loadMedicalRecords = async () => {
      try {
        setLoading(true);
        const result = await patientAPI.getMedicalRecords();
        if (result.success) {
          setMedicalRecords(result.medicalRecords);
        } else {
          toast.error(result.message || 'Failed to load medical records');
        }
      } catch (error) {
        console.error('Error loading medical records:', error);
        toast.error('Failed to load medical records');
      } finally {
        setLoading(false);
      }
    };

    loadMedicalRecords();
  }, []);

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

  const getRecordTypeColor = (type) => {
    switch (type) {
      case 'prescription':
        return 'bg-purple-100 text-purple-800';
      case 'appointment':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
            </div>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Medical Records Summary</h2>
              <p className="text-gray-600">Your complete medical history and records</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{medicalRecords.length}</p>
              <p className="text-sm text-gray-600">Total Records</p>
            </div>
          </div>
        </div>

        {/* Medical Records List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Medical Records</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : medicalRecords.length > 0 ? (
              <div className="space-y-6">
                {medicalRecords.map((record, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getRecordIcon(record.type)}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {record.type === 'prescription' ? 'Prescription' : 'Appointment'}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(record.type)}`}>
                            {record.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(record.date)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700 mb-2">{record.description}</p>
                      {record.doctor && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <UserIcon className="w-4 h-4" />
                          <span>Dr. {record.doctor.name}</span>
                          {record.doctor.specialization && (
                            <span className="text-gray-400">• {record.doctor.specialization}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Record Details */}
                    {record.type === 'prescription' && record.details && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-2">Prescription Details</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-purple-800">
                            <span className="font-medium">Medications:</span> {record.details.medicineList.length} medications
                          </p>
                          {record.details.dosageInstruction && (
                            <p className="text-sm text-purple-800">
                              <span className="font-medium">Instructions:</span> {record.details.dosageInstruction}
                            </p>
                          )}
                          <p className="text-sm text-purple-800">
                            <span className="font-medium">Status:</span> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              record.details.status === 'active' ? 'bg-green-100 text-green-800' :
                              record.details.status === 'dispensed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.details.status}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {record.type === 'appointment' && record.details && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Appointment Details</h4>
                        <div className="space-y-2">
                          {record.details.department && (
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Department:</span> {record.details.department}
                            </p>
                          )}
                          {record.details.duration && (
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Duration:</span> {record.details.duration} minutes
                            </p>
                          )}
                          {record.details.consultationFee && (
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Consultation Fee:</span> ${record.details.consultationFee}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Records</h3>
                <p className="text-gray-500">You don't have any medical records yet.</p>
                <p className="text-sm text-gray-400">Medical records will appear here after appointments and prescriptions.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MedicalRecords;
