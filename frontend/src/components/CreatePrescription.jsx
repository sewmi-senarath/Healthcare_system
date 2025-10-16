import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  DocumentTextIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import prescriptionAPI from '../utils/prescriptionAPI';
import toast from 'react-hot-toast';

const CreatePrescription = ({ onClose, onPrescriptionCreated }) => {
  const [loading, setLoading] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    patientID: '',
    medicineList: [{
      medicineName: '',
      strength: '',
      dosageForm: '',
      quantity: 1,
      dosageInstruction: '',
      frequency: '',
      duration: '',
      specialInstructions: '',
      refillsAllowed: 0
    }],
    dosageInstruction: '',
    diagnosis: '',
    symptoms: [],
    notes: '',
    followUpRequired: false,
    followUpDate: '',
    urgency: 'routine'
  });

  const [newSymptom, setNewSymptom] = useState('');

  const handleInputChange = (field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...prescriptionData.medicineList];
    updatedMedicines[index][field] = value;
    setPrescriptionData(prev => ({
      ...prev,
      medicineList: updatedMedicines
    }));
  };

  const addMedicine = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medicineList: [...prev.medicineList, {
        medicineName: '',
        strength: '',
        dosageForm: '',
        quantity: 1,
        dosageInstruction: '',
        frequency: '',
        duration: '',
        specialInstructions: '',
        refillsAllowed: 0
      }]
    }));
  };

  const removeMedicine = (index) => {
    if (prescriptionData.medicineList.length > 1) {
      const updatedMedicines = prescriptionData.medicineList.filter((_, i) => i !== index);
      setPrescriptionData(prev => ({
        ...prev,
        medicineList: updatedMedicines
      }));
    }
  };

  const addSymptom = () => {
    if (newSymptom.trim()) {
      setPrescriptionData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, newSymptom.trim()]
      }));
      setNewSymptom('');
    }
  };

  const removeSymptom = (index) => {
    const updatedSymptoms = prescriptionData.symptoms.filter((_, i) => i !== index);
    setPrescriptionData(prev => ({
      ...prev,
      symptoms: updatedSymptoms
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prescriptionData.patientID.trim()) {
      toast.error('Please enter Patient ID');
      return;
    }

    if (prescriptionData.medicineList.some(med => !med.medicineName.trim())) {
      toast.error('Please fill in all medicine names');
      return;
    }

    setLoading(true);
    try {
      const result = await prescriptionAPI.createPrescription(prescriptionData);
      
      if (result.success) {
        toast.success('Prescription created successfully!');
        onPrescriptionCreated(result.prescription);
        onClose();
      } else {
        toast.error(result.message || 'Failed to create prescription');
      }
    } catch (error) {
      console.error('Create prescription error:', error);
      toast.error('Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
            Create Prescription
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Patient Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID *
                </label>
                <input
                  type="text"
                  value={prescriptionData.patientID}
                  onChange={(e) => handleInputChange('patientID', e.target.value)}
                  placeholder="Enter Patient ID (e.g., PAT7813837WW)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={prescriptionData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Diagnosis and Symptoms */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnosis & Symptoms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={prescriptionData.diagnosis}
                  onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                  placeholder="Enter diagnosis"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Required
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={prescriptionData.followUpRequired}
                    onChange={(e) => handleInputChange('followUpRequired', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Yes</span>
                </div>
              </div>
            </div>
            
            {/* Symptoms */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Add symptom"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addSymptom}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {prescriptionData.symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BeakerIcon className="w-5 h-5 mr-2 text-green-600" />
                Medicines
              </h3>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Medicine
              </button>
            </div>

            {prescriptionData.medicineList.map((medicine, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Medicine {index + 1}</h4>
                  {prescriptionData.medicineList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      value={medicine.medicineName}
                      onChange={(e) => handleMedicineChange(index, 'medicineName', e.target.value)}
                      placeholder="e.g., Paracetamol"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strength
                    </label>
                    <input
                      type="text"
                      value={medicine.strength}
                      onChange={(e) => handleMedicineChange(index, 'strength', e.target.value)}
                      placeholder="e.g., 500mg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage Form
                    </label>
                    <select
                      value={medicine.dosageForm}
                      onChange={(e) => handleMedicineChange(index, 'dosageForm', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select form</option>
                      <option value="tablet">Tablet</option>
                      <option value="capsule">Capsule</option>
                      <option value="syrup">Syrup</option>
                      <option value="injection">Injection</option>
                      <option value="cream">Cream</option>
                      <option value="drops">Drops</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={medicine.quantity}
                      onChange={(e) => handleMedicineChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      value={medicine.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select frequency</option>
                      <option value="once daily">Once daily</option>
                      <option value="twice daily">Twice daily</option>
                      <option value="three times daily">Three times daily</option>
                      <option value="four times daily">Four times daily</option>
                      <option value="as needed">As needed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration *
                    </label>
                    <input
                      type="text"
                      value={medicine.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosage Instructions *
                  </label>
                  <textarea
                    value={medicine.dosageInstruction}
                    onChange={(e) => handleMedicineChange(index, 'dosageInstruction', e.target.value)}
                    placeholder="e.g., Take with food, before bedtime"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>
                    <input
                      type="text"
                      value={medicine.specialInstructions}
                      onChange={(e) => handleMedicineChange(index, 'specialInstructions', e.target.value)}
                      placeholder="e.g., Avoid alcohol"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refills Allowed
                    </label>
                    <input
                      type="number"
                      value={medicine.refillsAllowed}
                      onChange={(e) => handleMedicineChange(index, 'refillsAllowed', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={prescriptionData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes or instructions"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrescription;
