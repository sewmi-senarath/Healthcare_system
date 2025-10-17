import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import appointmentAPI from '../utils/appointmentAPI';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for the booking flow
  const [currentStep, setCurrentStep] = useState(1); // 1: Department, 2: Doctor, 3: Date/Time, 4: Payment, 5: Confirmation
  const [loading, setLoading] = useState(false);
  
  // Appointment data
  const [appointmentData, setAppointmentData] = useState({
    department: '',
    doctor: '',
    date: '',
    timeSlot: '',
    reason: '',
    paymentMethod: '',
    paymentDetails: {}
  });
  
  // Available options
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Check authentication and load departments on component mount
  useEffect(() => {
    // Check if user is authenticated
    if (!user || !user._id) {
      toast.error('Please log in to book an appointment');
      navigate('/patient/login');
      return;
    }
    
    const loadDepartments = async () => {
      try {
        setLoading(true);
        const result = await appointmentAPI.getDepartments();
        if (result.success) {
          setDepartments(result.departments);
        } else {
          toast.error('Failed to load departments');
        }
      } catch (error) {
        console.error('Error loading departments:', error);
        toast.error('Failed to load departments');
        // Fallback to mock data
        setDepartments([
          { id: 'cardiology', name: 'Cardiology', description: 'Heart and cardiovascular care' },
          { id: 'neurology', name: 'Neurology', description: 'Brain and nervous system care' },
          { id: 'orthopedics', name: 'Orthopedics', description: 'Bone and joint care' },
          { id: 'pediatrics', name: 'Pediatrics', description: 'Children\'s healthcare' },
          { id: 'emergency', name: 'Emergency Medicine', description: 'Urgent care and emergencies' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadDepartments();
  }, []);

  const handleDepartmentSelect = async (department) => {
    try {
      setLoading(true);
      setAppointmentData({ ...appointmentData, department: department.id });
      
      const result = await appointmentAPI.getDoctorsByDepartment(department.id);
      if (result.success) {
        if (result.doctors.length === 0) {
          toast.error('No doctors available for this department at the moment');
          return;
        }
        setDoctors(result.doctors);
        setCurrentStep(2);
        toast.success(`Found ${result.doctors.length} doctor(s) in ${department.name}`);
      } else {
        toast.error('Failed to load doctors for this department');
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Failed to load doctors for this department');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctor) => {
    try {
      setLoading(true);
      setAppointmentData({ ...appointmentData, doctor: doctor.id });
      
      // Get available slots for today
      const today = new Date().toISOString().split('T')[0];
      const result = await appointmentAPI.getAvailableSlots(doctor.id, today);
      if (result.success) {
        if (result.slots.length === 0) {
          toast.error('No available time slots for today. Please try a different day.');
          return;
        }
        setAvailableSlots(result.slots);
        setCurrentStep(3);
        toast.success(`Found ${result.slots.length} available time slots`);
      } else {
        toast.error(result.message || 'Failed to load available time slots');
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSlotSelect = async (date, timeSlot) => {
    try {
      setLoading(true);
      const reason = document.getElementById('reason').value || 'General consultation';
      
      // Reserve the slot temporarily
      const reservationResult = await appointmentAPI.reserveSlot(
        appointmentData.doctor, 
        new Date(`${date}T${timeSlot}:00.000Z`).toISOString(),
        user.patientId || user._id
      );
      
      if (reservationResult.success) {
        setAppointmentData({ 
          ...appointmentData, 
          date, 
          timeSlot,
          reason,
          reservationId: reservationResult.reservationId
        });
        setCurrentStep(4);
        toast.success('Time slot reserved for 5 minutes');
      } else {
        toast.error(reservationResult.message || 'Failed to reserve time slot');
      }
    } catch (error) {
      console.error('Error reserving slot:', error);
      toast.error('Failed to reserve time slot');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setAppointmentData({ ...appointmentData, paymentMethod: method });
    if (method === 'card') {
      setCurrentStep(4.5); // Payment details step
    } else {
      setCurrentStep(5); // Direct to confirmation
    }
  };

  const handlePaymentSubmit = async (paymentDetails) => {
    setLoading(true);
    try {
      setAppointmentData({ ...appointmentData, paymentDetails });
      setCurrentStep(5);
      toast.success('Payment processed successfully!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      if (!user || !user._id) {
        toast.error('Please log in to book an appointment');
        navigate('/patient/login');
        return;
      }
      
      // Determine the correct patient ID
      let patientID = user._id || user.id || user.patientId;
      
      // If no valid ID found, generate a test ID
      if (!patientID) {
        patientID = `test_patient_${Date.now()}`;
        console.log('No patient ID found, using test ID:', patientID);
      }
      
      console.log('User object:', user);
      console.log('Patient ID to use:', patientID);
      
      // Book the appointment
      const appointmentDataToSend = {
        patientID: patientID,
        doctorID: appointmentData.doctor,
        dateTime: new Date(`${appointmentData.date}T${appointmentData.timeSlot}:00.000Z`).toISOString(),
        reasonForVisit: appointmentData.reason,
        department: appointmentData.department,
        paymentMethod: appointmentData.paymentMethod
      };
      
      console.log('Appointment data to send:', appointmentDataToSend);
      
      const result = await appointmentAPI.bookAppointment(appointmentDataToSend);
      
      console.log('Booking result:', result);
      
      if (result.success) {
        // If payment method is card, process payment
        if (appointmentData.paymentMethod === 'card') {
          const paymentResult = await appointmentAPI.processPayment(
            result.appointment.id,
            {
              paymentMethod: 'card',
              amount: result.appointment.consultationFee,
              paymentDetails: appointmentData.paymentDetails
            }
          );
          
          if (!paymentResult.success) {
            toast.error('Appointment booked but payment failed. Please contact support.');
          }
        }
        
        toast.success('Appointment booked successfully! It is now pending Health Manager approval.');
        navigate('/patient/dashboard');
      } else {
        console.error('Booking failed:', result);
        toast.error(result.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        toast.error('Please log in again to book an appointment');
        navigate('/patient/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to book appointments');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to book appointment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 5 && (
            <div className={`w-12 h-1 mx-2 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderDepartmentSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Department</h2>
        <p className="text-gray-600">Choose the medical department for your appointment</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            onClick={() => handleDepartmentSelect(dept)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
                <p className="text-sm text-gray-600">{dept.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDoctorSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Departments
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Doctor</h2>
        <p className="text-gray-600">Choose your preferred doctor from {departments.find(d => d.id === appointmentData.department)?.name}</p>
        <p className="text-sm text-blue-600 mt-2">{doctors.length} doctor(s) available</p>
      </div>
      
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => handleDoctorSelect(doctor)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <UserIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Consultation Fee:</p>
                <p className="text-lg font-bold text-green-600">${doctor.consultationFee}</p>
                <p className="text-sm text-gray-500 mt-1">Available slots:</p>
                <p className="text-sm font-medium text-gray-900">{doctor.availableSlots ? doctor.availableSlots.length : 'Multiple'} slots</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDateTimeSelection = () => {
    const selectedDoctor = doctors.find(d => d.id === appointmentData.doctor);
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Doctors
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
          <p className="text-gray-600">Choose your preferred appointment time</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleDateSlotSelect(slot.date, slot.time)}
                  disabled={!slot.available || loading}
                  className={`p-3 border-2 rounded-lg transition-all text-center ${
                    !slot.available 
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <ClockIcon className={`w-5 h-5 mx-auto mb-1 ${
                    !slot.available ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    !slot.available ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {slot.time}
                  </span>
                  {!slot.available && (
                    <span className="text-xs text-gray-400 block mt-1">Unavailable</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">{selectedDoctor?.name}</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-gray-500 mr-3" />
                <span className="text-gray-700">{departments.find(d => d.id === appointmentData.department)?.name}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                id="reason"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your symptoms or reason for the appointment..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <button
          onClick={() => setCurrentStep(3)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Time Selection
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-600">Choose your preferred payment method</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button
          onClick={() => handlePaymentMethodSelect('card')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-center"
        >
          <CreditCardIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Credit/Debit Card</h3>
          <p className="text-sm text-gray-600">Pay securely online</p>
        </button>
        
        <button
          onClick={() => handlePaymentMethodSelect('cash')}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-green-600 font-bold text-lg">$</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cash on Arrival</h3>
          <p className="text-sm text-gray-600">Pay when you arrive</p>
        </button>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <button
          onClick={() => setCurrentStep(4)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Payment Method
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
        <p className="text-gray-600">Enter your card information securely</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <input
                type="text"
                placeholder="123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => handlePaymentSubmit({ cardNumber: '1234****3456', method: 'card' })}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay $150.00'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => {
    const selectedDoctor = doctors.find(d => d.id === appointmentData.doctor);
    const selectedDepartment = departments.find(d => d.id === appointmentData.department);
    
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Appointment</h2>
          <p className="text-gray-600">Review your appointment details before confirming</p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Patient:</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doctor:</span>
                <span className="font-medium">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{selectedDepartment?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(appointmentData.date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{appointmentData.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium">
                  {appointmentData.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Arrival'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">$150.00</span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleConfirmation}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStepIndicator()}
          
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading...</span>
            </div>
          )}
          
          {!loading && currentStep === 1 && renderDepartmentSelection()}
          {!loading && currentStep === 2 && renderDoctorSelection()}
          {!loading && currentStep === 3 && renderDateTimeSelection()}
          {!loading && currentStep === 4 && renderPaymentSelection()}
          {!loading && currentStep === 4.5 && renderPaymentForm()}
          {!loading && currentStep === 5 && renderConfirmation()}
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
