import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, ClockIcon, UserIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import appointmentAPI from '../utils/appointmentAPI';
import authorityAPI from '../utils/authorityAPI';
import toast from 'react-hot-toast';

const AppointmentsPage = () => {
  const { user, userType } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    loadAppointments();
  }, [user, userType, selectedStatus]);

  // Add refresh functionality
  const handleRefresh = () => {
    loadAppointments();
  };

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let result;

      if (userType === 'doctor') {
        result = await appointmentAPI.getDoctorAppointments(user.empID);
      } else if (userType === 'healthCareManager') {
        result = await appointmentAPI.getAllAppointmentsForManager();
      } else if (userType === 'nurse') {
        result = await appointmentAPI.getAllAppointmentsForManager();
      } else {
        toast.error('Access denied');
        return;
      }

      if (result.success) {
        let filteredAppointments = result.appointments || [];
        
        // Filter by status if not 'all'
        if (selectedStatus !== 'all') {
          filteredAppointments = filteredAppointments.filter(apt => apt.status === selectedStatus);
        }

        setAppointments(filteredAppointments);
      } else {
        // Don't show error toast for no data found, just set empty array
        console.log('No appointments found:', result.message);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Don't show error toast, just set empty array
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    try {
      const result = await authorityAPI.approveAppointment(appointmentId, 'Appointment approved by Health Manager');
      if (result.success) {
        toast.success('Appointment approved successfully');
        loadAppointments(); // Reload appointments
      } else {
        toast.error(result.message || 'Failed to approve appointment');
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      toast.error('Failed to approve appointment');
    }
  };

  const handleDecline = async (appointmentId) => {
    const reason = prompt('Please provide a reason for declining this appointment:');
    if (!reason) return;

    try {
      const result = await authorityAPI.declineAppointment(appointmentId, reason);
      if (result.success) {
        toast.success('Appointment declined successfully');
        loadAppointments(); // Reload appointments
      } else {
        toast.error(result.message || 'Failed to decline appointment');
      }
    } catch (error) {
      console.error('Error declining appointment:', error);
      toast.error('Failed to decline appointment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'declined':
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'pending_approval':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'declined':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
              <p className="text-gray-600 mt-1">
                {userType === 'doctor' 
                  ? 'Your appointments'
                  : userType === 'nurse'
                  ? 'View all patient appointments for care coordination'
                  : 'Manage all appointments'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="declined">Declined</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedStatus === 'all' ? 'No appointments found' : `No ${selectedStatus} appointments`}
            </h3>
            <p className="text-gray-500 mb-4">
              {userType === 'doctor' 
                ? selectedStatus === 'all' 
                  ? 'You don\'t have any appointments yet. Patients can book appointments with you through the booking system.'
                  : `You don't have any appointments with status "${selectedStatus}". Try selecting "All Status" to see all your appointments.`
                : selectedStatus === 'all'
                  ? 'No appointments have been booked yet. When patients book appointments, they will appear here for your approval.'
                  : `No appointments with status "${selectedStatus}" found. Try selecting "All Status" to see all appointments.`
              }
            </p>
            {userType === 'doctor' && (
              <div className="text-sm text-blue-600">
                💡 Tip: Make sure your profile is complete so patients can find and book appointments with you.
              </div>
            )}
            {userType === 'healthCareManager' && (
              <div className="text-sm text-blue-600">
                💡 Tip: New appointments will appear here when patients book them and need your approval.
              </div>
            )}
            {userType === 'nurse' && (
              <div className="text-sm text-blue-600">
                💡 Tip: You can view all patient appointments to help coordinate care and patient flow.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      {getStatusIcon(appointment.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {appointment.appointmentID}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDateTime(appointment.dateTime)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Patient: {appointment.patientID?.name || 'Unknown Patient'}
                        </span>
                      </div>

                      {userType === 'healthCareManager' && appointment.doctorID && (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Doctor: {appointment.doctorID.name || 'Unknown Doctor'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Reason for visit:</p>
                      <p className="text-gray-900">{appointment.reasonForVisit}</p>
                    </div>

                    {appointment.consultationFee && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Consultation Fee: ${appointment.consultationFee}</p>
                        <p className="text-sm text-gray-600">Payment Status: {appointment.paymentStatus || 'pending'}</p>
                      </div>
                    )}

                    {appointment.approvalWorkflow?.declineReason && (
                      <div className="mb-4 p-3 bg-red-50 rounded-md">
                        <p className="text-sm text-red-700">
                          <strong>Decline Reason:</strong> {appointment.approvalWorkflow.declineReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Health Manager */}
                  {userType === 'healthCareManager' && appointment.status === 'pending_approval' && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleApprove(appointment._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecline(appointment._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
