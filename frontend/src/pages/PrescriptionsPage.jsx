import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import prescriptionAPI from '../utils/prescriptionAPI';
import CreatePrescription from '../components/CreatePrescription';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  UserIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const PrescriptionsPage = () => {
  const { user, userType } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePrescription, setShowCreatePrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionDetails, setShowPrescriptionDetails] = useState(false);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      let result;
      
      if (userType === 'doctor') {
        result = await prescriptionAPI.getDoctorPrescriptions();
      } else if (userType === 'pharmacist') {
        result = await prescriptionAPI.getPharmacistPrescriptions();
      } else if (userType === 'patient') {
        result = await prescriptionAPI.getPatientPrescriptions();
      } else {
        toast.error('Access denied');
        return;
      }

      if (result.success) {
        setPrescriptions(result.prescriptions || []);
      } else {
        toast.error(result.message || 'Failed to load prescriptions');
        setPrescriptions([]);
      }
    } catch (error) {
      console.error('Load prescriptions error:', error);
      toast.error('Failed to load prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = (prescription) => {
    setPrescriptions(prev => [prescription, ...prev]);
    setShowCreatePrescription(false);
  };

  const handleViewPrescription = async (prescriptionId) => {
    try {
      const result = await prescriptionAPI.getPrescriptionById(prescriptionId);
      if (result.success) {
        setSelectedPrescription(result.prescription);
        setShowPrescriptionDetails(true);
      } else {
        toast.error(result.message || 'Failed to load prescription details');
      }
    } catch (error) {
      console.error('View prescription error:', error);
      toast.error('Failed to load prescription details');
    }
  };

  const handleUpdateStatus = async (prescriptionId, status) => {
    try {
      const result = await prescriptionAPI.updatePrescriptionStatus(prescriptionId, status);
      if (result.success) {
        toast.success(`Prescription ${status} successfully`);
        loadPrescriptions(); // Reload prescriptions
        setShowPrescriptionDetails(false);
      } else {
        toast.error(result.message || 'Failed to update prescription status');
      }
    } catch (error) {
      console.error('Update prescription status error:', error);
      toast.error('Failed to update prescription status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'sent_to_pharmacy':
        return <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />;
      case 'dispensed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent_to_pharmacy':
        return 'bg-blue-100 text-blue-800';
      case 'dispensed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-8 h-8 mr-3 text-blue-600" />
                {userType === 'doctor' ? 'My Prescriptions' : 
                 userType === 'pharmacist' ? 'Pharmacy Prescriptions' : 
                 'My Prescriptions'}
              </h1>
              <p className="text-gray-600 mt-1">
                {userType === 'doctor' 
                  ? 'Manage patient prescriptions'
                  : userType === 'pharmacist'
                  ? 'Review and process prescriptions'
                  : 'View your prescription history and current medications'
                }
              </p>
            </div>
            {userType === 'doctor' && (
              <button
                onClick={() => setShowCreatePrescription(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Prescription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500 mb-6">
              {userType === 'doctor' 
                ? 'Create your first prescription to get started.'
                : userType === 'pharmacist'
                ? 'No prescriptions are currently available for processing.'
                : 'You don\'t have any prescriptions yet. Visit a doctor to get your first prescription.'
              }
            </p>
            {userType === 'doctor' && (
              <button
                onClick={() => setShowCreatePrescription(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Prescription
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {prescriptions.map((prescription) => (
              <div key={prescription.prescriptionID} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Prescription #{prescription.prescriptionID}
                      </h3>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                        {getStatusIcon(prescription.status)}
                        <span className="ml-1 capitalize">{prescription.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="w-4 h-4 mr-2" />
                        Patient ID: {prescription.patientID}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formatDate(prescription.dateIssued)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BeakerIcon className="w-4 h-4 mr-2" />
                        {prescription.medicineList.length} medicine(s)
                      </div>
                    </div>

                    {prescription.prescriptionDetails?.diagnosis && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Diagnosis:</strong> {prescription.prescriptionDetails.diagnosis}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {prescription.medicineList.slice(0, 3).map((medicine, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {medicine.medicineName}
                        </span>
                      ))}
                      {prescription.medicineList.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                          +{prescription.medicineList.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleViewPrescription(prescription.prescriptionID)}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <EyeIcon className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Prescription Modal */}
      {showCreatePrescription && (
        <CreatePrescription
          onClose={() => setShowCreatePrescription(false)}
          onPrescriptionCreated={handleCreatePrescription}
        />
      )}

      {/* Prescription Details Modal */}
      {showPrescriptionDetails && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Prescription Details
              </h2>
              <button
                onClick={() => setShowPrescriptionDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Prescription Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Prescription Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>ID:</strong> {selectedPrescription.prescriptionID}</p>
                    <p><strong>Patient ID:</strong> {selectedPrescription.patientID}</p>
                    <p><strong>Doctor ID:</strong> {selectedPrescription.doctorId}</p>
                    <p><strong>Date Issued:</strong> {formatDate(selectedPrescription.dateIssued)}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPrescription.status)}`}>
                        {getStatusIcon(selectedPrescription.status)}
                        <span className="ml-1 capitalize">{selectedPrescription.status.replace('_', ' ')}</span>
                      </span>
                    </p>
                  </div>
                </div>

                {selectedPrescription.prescriptionDetails && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Medical Details</h3>
                    <div className="space-y-2 text-sm">
                      {selectedPrescription.prescriptionDetails.diagnosis && (
                        <p><strong>Diagnosis:</strong> {selectedPrescription.prescriptionDetails.diagnosis}</p>
                      )}
                      {selectedPrescription.prescriptionDetails.symptoms && selectedPrescription.prescriptionDetails.symptoms.length > 0 && (
                        <p><strong>Symptoms:</strong> {selectedPrescription.prescriptionDetails.symptoms.join(', ')}</p>
                      )}
                      {selectedPrescription.prescriptionDetails.urgency && (
                        <p><strong>Urgency:</strong> {selectedPrescription.prescriptionDetails.urgency}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Medicines */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-4">Medicines</h3>
                <div className="space-y-4">
                  {selectedPrescription.medicineList.map((medicine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{medicine.medicineName}</p>
                          {medicine.strength && <p className="text-sm text-gray-600">Strength: {medicine.strength}</p>}
                          {medicine.dosageForm && <p className="text-sm text-gray-600">Form: {medicine.dosageForm}</p>}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Quantity: {medicine.quantity}</p>
                          <p className="text-sm text-gray-600">Frequency: {medicine.frequency}</p>
                          <p className="text-sm text-gray-600">Duration: {medicine.duration}</p>
                        </div>
                      </div>
                      {medicine.dosageInstruction && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Instructions:</strong> {medicine.dosageInstruction}
                        </p>
                      )}
                      {medicine.specialInstructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Special Instructions:</strong> {medicine.specialInstructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Pharmacist */}
              {userType === 'pharmacist' && selectedPrescription.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedPrescription.prescriptionID, 'sent_to_pharmacy')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Send to Pharmacy
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPrescription.prescriptionID, 'dispensed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark as Dispensed
                  </button>
                </div>
              )}

              {userType === 'pharmacist' && selectedPrescription.status === 'sent_to_pharmacy' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedPrescription.prescriptionID, 'dispensed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark as Dispensed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPrescription.prescriptionID, 'completed')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                </div>
              )}

              {/* Information for Patients */}
              {userType === 'patient' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Prescription Status</h4>
                  <p className="text-blue-800 text-sm">
                    {selectedPrescription.status === 'pending' && 'Your prescription is being reviewed by the pharmacy.'}
                    {selectedPrescription.status === 'sent_to_pharmacy' && 'Your prescription has been sent to the pharmacy and is ready for pickup.'}
                    {selectedPrescription.status === 'dispensed' && 'Your medication has been dispensed. Please follow the dosage instructions.'}
                    {selectedPrescription.status === 'completed' && 'Your prescription has been completed.'}
                    {selectedPrescription.status === 'cancelled' && 'This prescription has been cancelled.'}
                  </p>
                  {selectedPrescription.expiryDate && (
                    <p className="text-blue-700 text-xs mt-2">
                      <strong>Expires:</strong> {new Date(selectedPrescription.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsPage;
