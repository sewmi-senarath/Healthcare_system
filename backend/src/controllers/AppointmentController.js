// import Appointment from '../models/Appointment.js';
// import Doctor from '../models/Doctor.js';
// import Patient from '../models/Patient.js';
// import User from '../models/User.js';
// import Notification from '../models/Notification.js';

// /**
//  * AppointmentController - Handles all appointment-related operations
//  * Following Single Responsibility Principle
//  */
// class AppointmentController {
//   /**
//    * Get all available departments
//    */
//   static async getDepartments() {
//     try {
//       // In a real application, this would come from a departments collection
//       const departments = [
//         {
//           id: 'cardiology',
//           name: 'Cardiology',
//           description: 'Heart and cardiovascular care',
//           icon: 'heart',
//           color: 'red'
//         },
//         {
//           id: 'neurology',
//           name: 'Neurology',
//           description: 'Brain and nervous system care',
//           icon: 'brain',
//           color: 'blue'
//         },
//         {
//           id: 'orthopedics',
//           name: 'Orthopedics',
//           description: 'Bone and joint care',
//           icon: 'bone',
//           color: 'green'
//         },
//         {
//           id: 'pediatrics',
//           name: 'Pediatrics',
//           description: 'Children\'s healthcare',
//           icon: 'baby',
//           color: 'yellow'
//         },
//         {
//           id: 'emergency',
//           name: 'Emergency Medicine',
//           description: 'Urgent care and emergencies',
//           icon: 'ambulance',
//           color: 'red'
//         }
//       ];

//       return {
//         success: true,
//         message: 'Departments retrieved successfully',
//         departments
//       };
//     } catch (error) {
//       console.error('Get departments error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get doctors by department
//    */
//   static async getDoctorsByDepartment(department) {
//     try {
//       console.log(`Getting doctors for department: ${department}`);
      
//       // Find doctors by specialization (department maps to specialization)
//       const doctors = await Doctor.find({ 
//         specialization: department,
//         isActive: true
//       }).select('name specialization consultationFee availability phone preferredCommunicationMethod empID');

//       if (!doctors || doctors.length === 0) {
//         console.log(`No doctors found in database for department: ${department}. Using mock data.`);
        
//         // Mock data as fallback when no doctors are found in database
//         const mockDoctors = this.getMockDoctorsByDepartment(department);
        
//         return {
//           success: true,
//           message: 'No doctors found in database, using sample data',
//           doctors: mockDoctors
//         };
//       }

//       // Format doctor data for frontend
//       const formattedDoctors = doctors.map(doctor => ({
//         id: doctor._id,
//         empID: doctor.empID,
//         name: doctor.name,
//         specialization: doctor.specialization,
//         consultationFee: doctor.consultationFee,
//         phone: doctor.phone,
//         preferredCommunicationMethod: doctor.preferredCommunicationMethod,
//         availableSlots: this.generateAvailableSlots(doctor.availability)
//       }));

//       return {
//         success: true,
//         message: 'Doctors retrieved successfully',
//         doctors: formattedDoctors
//       };
//     } catch (error) {
//       console.error('Get doctors by department error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get mock doctors by department (fallback when no doctors in database)
//    */
//   static getMockDoctorsByDepartment(department) {
//     const mockDoctorsData = {
//       cardiology: [
//         {
//           id: 'mock_doc_1',
//           name: 'Dr. Sarah Johnson',
//           specialization: 'Interventional Cardiology',
//           consultationFee: 150,
//           phone: '+1234567890',
//           preferredCommunicationMethod: 'email',
//           availableSlots: ['09:00', '10:00', '14:00', '15:00']
//         },
//         {
//           id: 'mock_doc_2',
//           name: 'Dr. Michael Chen',
//           specialization: 'Cardiac Surgery',
//           consultationFee: 200,
//           phone: '+1234567891',
//           preferredCommunicationMethod: 'phone',
//           availableSlots: ['08:00', '11:00', '13:00', '16:00']
//         }
//       ],
//       neurology: [
//         {
//           id: 'mock_doc_3',
//           name: 'Dr. Emily Davis',
//           specialization: 'Neurological Surgery',
//           consultationFee: 180,
//           phone: '+1234567892',
//           preferredCommunicationMethod: 'email',
//           availableSlots: ['09:30', '11:30', '14:30', '16:30']
//         },
//         {
//           id: 'mock_doc_4',
//           name: 'Dr. Robert Wilson',
//           specialization: 'Epilepsy',
//           consultationFee: 160,
//           phone: '+1234567893',
//           preferredCommunicationMethod: 'phone',
//           availableSlots: ['08:30', '10:30', '13:30', '15:30']
//         }
//       ],
//       orthopedics: [
//         {
//           id: 'mock_doc_5',
//           name: 'Dr. Lisa Anderson',
//           specialization: 'Sports Medicine',
//           consultationFee: 140,
//           phone: '+1234567894',
//           preferredCommunicationMethod: 'email',
//           availableSlots: ['09:00', '12:00', '14:00', '17:00']
//         },
//         {
//           id: 'mock_doc_6',
//           name: 'Dr. James Martinez',
//           specialization: 'Orthopedic Surgery',
//           consultationFee: 220,
//           phone: '+1234567895',
//           preferredCommunicationMethod: 'phone',
//           availableSlots: ['08:00', '11:00', '15:00', '16:00']
//         }
//       ],
//       pediatrics: [
//         {
//           id: 'mock_doc_7',
//           name: 'Dr. Maria Garcia',
//           specialization: 'General Pediatrics',
//           consultationFee: 120,
//           phone: '+1234567896',
//           preferredCommunicationMethod: 'email',
//           availableSlots: ['08:00', '10:00', '13:00', '15:00']
//         },
//         {
//           id: 'mock_doc_8',
//           name: 'Dr. David Thompson',
//           specialization: 'Pediatric Cardiology',
//           consultationFee: 170,
//           phone: '+1234567897',
//           preferredCommunicationMethod: 'phone',
//           availableSlots: ['09:00', '11:00', '14:00', '16:00']
//         }
//       ],
//       emergency: [
//         {
//           id: 'mock_doc_9',
//           name: 'Dr. Jennifer Brown',
//           specialization: 'Emergency Medicine',
//           consultationFee: 100,
//           phone: '+1234567898',
//           preferredCommunicationMethod: 'phone',
//           availableSlots: ['24/7']
//         }
//       ]
//     };

//     return mockDoctorsData[department] || [];
//   }

//   /**
//    * Get mock doctor by ID
//    */
//   static getMockDoctorById(doctorId) {
//     const allMockDoctors = {
//       ...this.getMockDoctorsByDepartment('cardiology'),
//       ...this.getMockDoctorsByDepartment('neurology'),
//       ...this.getMockDoctorsByDepartment('orthopedics'),
//       ...this.getMockDoctorsByDepartment('pediatrics'),
//       ...this.getMockDoctorsByDepartment('emergency')
//     };
    
//     // Find doctor by ID in all departments
//     for (const department of ['cardiology', 'neurology', 'orthopedics', 'pediatrics', 'emergency']) {
//       const doctors = this.getMockDoctorsByDepartment(department);
//       const foundDoctor = doctors.find(doc => doc.id === doctorId);
//       if (foundDoctor) {
//         return foundDoctor;
//       }
//     }
    
//     return null;
//   }

//   /**
//    * Generate available time slots for mock doctors
//    */
//   static generateMockAvailableSlots(mockSlots, date) {
//     if (mockSlots.includes('24/7')) {
//       // Emergency doctor - available all day
//       const slots = [];
//       for (let hour = 8; hour < 18; hour++) {
//         const timeString = `${hour.toString().padStart(2, '0')}:00`;
//         slots.push({
//           date: date,
//           time: timeString,
//           available: true
//         });
//       }
//       return slots;
//     } else {
//       // Regular doctors with specific time slots
//       return mockSlots.map(time => ({
//         date: date,
//         time: time,
//         available: true
//       }));
//     }
//   }

//   /**
//    * Generate available time slots based on doctor's availability
//    */
//   static generateAvailableSlots(availability) {
//     const slots = [];
//     const today = new Date();
    
//     // If no availability data, return empty slots
//     if (!availability) {
//       console.log('No availability data for doctor');
//       return [];
//     }
    
//     // Generate slots for today and the next 7 days
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(today);
//       date.setDate(today.getDate() + i);
//       const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
//       // Check if doctor has availability for this day
//       const dayAvailability = availability[dayName];
//       if (!dayAvailability || dayAvailability.length === 0) {
//         continue; // Skip days with no availability
//       }
      
//       // Generate slots based on doctor's availability
//       dayAvailability.forEach(timeSlot => {
//         const startTime = timeSlot.start;
//         const endTime = timeSlot.end;
        
//         // Parse start and end times
//         const [startHour, startMin] = startTime.split(':').map(Number);
//         const [endHour, endMin] = endTime.split(':').map(Number);
        
//         // Generate 30-minute slots between start and end time
//         let currentHour = startHour;
//         let currentMin = startMin;
        
//         while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
//           const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
//           slots.push({
//             date: date.toISOString().split('T')[0],
//             time: timeString,
//             available: true
//           });
          
//           // Add 30 minutes
//           currentMin += 30;
//           if (currentMin >= 60) {
//             currentMin = 0;
//             currentHour++;
//           }
//         }
//       });
//     }
    
//     return slots;
//   }

//   /**
//    * Get available time slots for a doctor
//    */
//   static async getAvailableSlots(doctorId, date) {
//     try {
//       console.log(`Getting available slots for doctor: ${doctorId}, date: ${date}`);
      
//       let doctor = null;
//       let mockDoctor = null;
      
//       // Check if it's a mock doctor ID
//       if (doctorId.startsWith('mock_doc_')) {
//         console.log('Using mock doctor data for available slots');
//         mockDoctor = this.getMockDoctorById(doctorId);
//         if (!mockDoctor) {
//           return {
//             success: false,
//             message: 'Mock doctor not found'
//           };
//         }
//       } else {
//         // Find the real doctor in database
//         doctor = await Doctor.findById(doctorId);
//         if (!doctor) {
//           return {
//             success: false,
//             message: 'Doctor not found'
//           };
//         }
//       }

//       // Get existing appointments for the date
//       const existingAppointments = await Appointment.find({
//         doctorID: doctorId,
//         dateTime: {
//           $gte: new Date(`${date}T00:00:00.000Z`),
//           $lt: new Date(`${date}T23:59:59.999Z`)
//         },
//         status: { $in: ['confirmed', 'reserved'] }
//       });

//       // Generate available slots based on doctor type
//       let allSlots;
//       if (mockDoctor) {
//         allSlots = this.generateMockAvailableSlots(mockDoctor.availableSlots, date);
//       } else {
//         allSlots = this.generateAvailableSlots(doctor.availability);
//       }
      
//       const dateSlots = allSlots.filter(slot => slot.date === date);
      
//       // Mark slots as unavailable if they have existing appointments
//       const availableSlots = dateSlots.map(slot => {
//         const slotDateTime = new Date(`${slot.date}T${slot.time}:00.000Z`);
//         const hasAppointment = existingAppointments.some(apt => {
//           const aptTime = new Date(apt.dateTime);
//           return aptTime.getHours() === slotDateTime.getHours();
//         });
        
//         return {
//           ...slot,
//           available: !hasAppointment
//         };
//       });

//       return {
//         success: true,
//         message: 'Available slots retrieved successfully',
//         slots: availableSlots
//       };
//     } catch (error) {
//       console.error('Get available slots error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Temporarily reserve a time slot
//    */
//   static async reserveSlot(data) {
//     try {
//       const { doctorId, dateTime, patientId } = data;
      
//       console.log(`Reserving slot for doctor: ${doctorId}, patient: ${patientId}, time: ${dateTime}`);
      
//       // Check if slot is still available
//       const existingAppointment = await Appointment.findOne({
//         doctorID: doctorId,
//         dateTime: new Date(dateTime),
//         status: { $in: ['confirmed', 'reserved'] }
//       });

//       if (existingAppointment) {
//         return {
//           success: false,
//           message: 'Time slot is no longer available'
//         };
//       }

//       // Create a temporary reservation
//       const reservation = new Appointment({
//         appointmentID: `APT${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
//         patientID: patientId,
//         doctorID: doctorId,
//         dateTime: new Date(dateTime),
//         status: 'reserved',
//         reasonForVisit: 'Temporary slot reservation for booking process',
//         appointmentDetails: {
//           duration: 30,
//           appointmentType: 'consultation',
//           priority: 'routine',
//           location: {
//             department: 'temporary'
//           }
//         },
//         approvalWorkflow: {
//           requestedDate: new Date(),
//           approvalStatus: 'pending',
//           requiresManagerApproval: false,
//           autoApproved: true
//         },
//         notifications: {
//           patientNotified: false,
//           doctorNotified: false,
//           managerNotified: false,
//           reminderSent: false
//         },
//         rescheduling: {
//           rescheduleCount: 0,
//           rescheduleHistory: []
//         },
//         consultationFee: 150, // Default fee for mock doctors
//         paymentMethod: 'pending',
//         paymentStatus: 'pending'
//       });

//       await reservation.save();

//       // Set expiration time (5 minutes)
//       setTimeout(async () => {
//         try {
//           const apt = await Appointment.findById(reservation._id);
//           if (apt && apt.status === 'reserved') {
//             apt.status = 'expired';
//             await apt.save();
//             console.log(`Reservation expired for appointment: ${apt.appointmentID}`);
//           }
//         } catch (error) {
//           console.error('Error expiring reservation:', error);
//         }
//       }, 5 * 60 * 1000); // 5 minutes

//       return {
//         success: true,
//         message: 'Time slot reserved successfully',
//         reservationId: reservation._id,
//         expiresIn: 5 * 60 // 5 minutes in seconds
//       };
//     } catch (error) {
//       console.error('Reserve slot error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Book an appointment
//    */
//   static async bookAppointment(appointmentData, user) {
//     try {
//       console.log('=== BOOKING APPOINTMENT ===');
//       console.log('Appointment data:', appointmentData);
//       console.log('User:', user);
      
//       const {
//         patientID,
//         doctorID,
//         dateTime,
//         reasonForVisit,
//         department,
//         paymentMethod = 'cash'
//       } = appointmentData;

//       // Verify patient exists
//       let patient = null;
//       try {
//         patient = await Patient.findById(patientID);
//       } catch (error) {
//         console.log('Patient ID validation error:', error.message);
//       }
      
//       if (!patient) {
//         // For testing purposes, create a mock patient if not found
//         console.log(`Patient not found with ID: ${patientID}. Using mock patient for testing.`);
//         patient = {
//           _id: patientID,
//           name: user?.name || 'Test Patient',
//           email: user?.email || 'test@example.com'
//         };
//       }

//       // Verify doctor exists (handle both real and mock doctors)
//       let doctor = null;
//       let mockDoctor = null;
      
//       if (doctorID.startsWith('mock_doc_')) {
//         console.log('Using mock doctor for booking');
//         mockDoctor = this.getMockDoctorById(doctorID);
//         if (!mockDoctor) {
//           return {
//             success: false,
//             message: 'Mock doctor not found'
//           };
//         }
//         doctor = mockDoctor;
//       } else {
//         doctor = await Doctor.findById(doctorID);
//         if (!doctor) {
//           return {
//             success: false,
//             message: 'Doctor not found'
//           };
//         }
//       }

//       // Check if there's a reserved appointment for this slot
//       const existingReservation = await Appointment.findOne({
//         doctorID: doctorID,
//         dateTime: new Date(dateTime),
//         status: 'reserved'
//       });

//       // Check if there's a confirmed appointment (different from reserved)
//       const existingConfirmedAppointment = await Appointment.findOne({
//         doctorID: doctorID,
//         dateTime: new Date(dateTime),
//         status: 'confirmed'
//       });

//       if (existingConfirmedAppointment) {
//         return {
//           success: false,
//           message: 'Time slot is no longer available'
//         };
//       }

//       let appointment;
      
//       if (existingReservation) {
//         // Update the existing reservation to a full appointment
//         console.log('Updating existing reservation to full appointment');
//         appointment = existingReservation;
        
//         // Update the reservation with full appointment details
//         appointment.patientID = patientID;
//         appointment.status = 'pending_approval'; // All appointments need Health Manager approval
//         appointment.reasonForVisit = reasonForVisit;
//         appointment.appointmentDetails = {
//           duration: 30,
//           appointmentType: 'consultation',
//           priority: 'routine',
//           location: {
//             department: department
//           }
//         };
//         appointment.approvalWorkflow = {
//           requestedDate: new Date(),
//           approvalStatus: 'pending',
//           requiresManagerApproval: true,
//           autoApproved: false
//         };
//         appointment.notifications = {
//           patientNotified: false,
//           doctorNotified: false,
//           managerNotified: false,
//           reminderSent: false
//         };
//         appointment.rescheduling = {
//           rescheduleCount: 0,
//           rescheduleHistory: []
//         };
//         appointment.consultationFee = doctor.consultationFee || 150;
//         appointment.paymentMethod = paymentMethod;
//         appointment.paymentStatus = paymentMethod === 'cash' ? 'paid' : 'pending';
        
//         await appointment.save();
//       } else {
//         // Create new appointment
//         console.log('Creating new appointment');
//         appointment = new Appointment({
//           appointmentID: `APT${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
//           patientID: patientID,
//           doctorID: doctorID,
//           dateTime: new Date(dateTime),
//           status: 'pending_approval', // All appointments need Health Manager approval
//           reasonForVisit: reasonForVisit,
//           appointmentDetails: {
//             duration: 30,
//             appointmentType: 'consultation',
//             priority: 'routine',
//             location: {
//               department: department
//             }
//           },
//           approvalWorkflow: {
//             requestedDate: new Date(),
//             approvalStatus: 'pending',
//             requiresManagerApproval: true,
//             autoApproved: false
//           },
//           notifications: {
//             patientNotified: false,
//             doctorNotified: false,
//             managerNotified: false,
//             reminderSent: false
//           },
//           rescheduling: {
//             rescheduleCount: 0,
//             rescheduleHistory: []
//           },
//           consultationFee: doctor.consultationFee || 150,
//           paymentMethod: paymentMethod,
//           paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending'
//         });

//         await appointment.save();
//       }

//       // Send notifications
//       await this.sendAppointmentNotifications(appointment, patient, doctor);

//       return {
//         success: true,
//         message: 'Appointment booked successfully',
//         appointment: {
//           id: appointment._id,
//           appointmentID: appointment.appointmentID,
//           status: appointment.status,
//           dateTime: appointment.dateTime,
//           consultationFee: appointment.consultationFee
//         }
//       };
//     } catch (error) {
//       console.error('=== BOOK APPOINTMENT ERROR ===');
//       console.error('Error details:', error);
//       console.error('Error message:', error.message);
//       console.error('Error stack:', error.stack);
      
//       // Return a more specific error message
//       return {
//         success: false,
//         message: `Booking failed: ${error.message}`,
//         error: error.message
//       };
//     }
//   }

//   /**
//    * Process payment for an appointment
//    */
//   static async processPayment(appointmentId, paymentData, user) {
//     try {
//       console.log('Processing payment for appointment:', appointmentId);
      
//       const { paymentMethod, amount, paymentDetails } = paymentData;

//       // Find the appointment
//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         return {
//           success: false,
//           message: 'Appointment not found'
//         };
//       }

//       // Simulate payment processing
//       const paymentResult = await this.simulatePayment(paymentMethod, amount, paymentDetails);

//       if (paymentResult.success) {
//         // Update appointment status
//         appointment.status = 'confirmed';
//         appointment.paymentStatus = 'paid';
//         appointment.paymentDetails = paymentDetails;
//         await appointment.save();

//         // Send confirmation notifications
//         await this.sendPaymentConfirmationNotifications(appointment);

//         return {
//           success: true,
//           message: 'Payment processed successfully',
//           appointment: {
//             id: appointment._id,
//             status: appointment.status,
//             paymentStatus: appointment.paymentStatus
//           }
//         };
//       } else {
//         return {
//           success: false,
//           message: paymentResult.message || 'Payment failed'
//         };
//       }
//     } catch (error) {
//       console.error('Process payment error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Simulate payment processing
//    */
//   static async simulatePayment(method, amount, details) {
//     // Simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     // Simulate payment success (90% success rate)
//     const success = Math.random() > 0.1;
    
//     if (success) {
//       return {
//         success: true,
//         transactionId: `TXN${Date.now()}`,
//         message: 'Payment successful'
//       };
//     } else {
//       return {
//         success: false,
//         message: 'Payment declined by bank'
//       };
//     }
//   }

//   /**
//    * Get appointments for a patient
//    */
//   static async getPatientAppointments(patientId, user) {
//     try {
//       const appointments = await Appointment.find({ patientID: patientId })
//         .populate('doctorID', 'name specialization')
//         .sort({ dateTime: -1 });

//       return {
//         success: true,
//         message: 'Patient appointments retrieved successfully',
//         appointments: appointments.map(apt => ({
//           id: apt._id,
//           appointmentID: apt.appointmentID,
//           doctor: apt.doctorID,
//           dateTime: apt.dateTime,
//           status: apt.status,
//           reasonForVisit: apt.reasonForVisit,
//           consultationFee: apt.consultationFee
//         }))
//       };
//     } catch (error) {
//       console.error('Get patient appointments error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get appointments for a doctor
//    */
//   static async getDoctorAppointments(doctorId, date, user) {
//     try {
//       const query = { doctorID: doctorId };
      
//       if (date) {
//         const startDate = new Date(`${date}T00:00:00.000Z`);
//         const endDate = new Date(`${date}T23:59:59.999Z`);
//         query.dateTime = { $gte: startDate, $lte: endDate };
//       }

//       const appointments = await Appointment.find(query)
//         .populate('patientID', 'name email phone')
//         .sort({ dateTime: 1 });

//       return {
//         success: true,
//         message: 'Doctor appointments retrieved successfully',
//         appointments: appointments.map(apt => ({
//           id: apt._id,
//           appointmentID: apt.appointmentID,
//           patient: apt.patientID,
//           dateTime: apt.dateTime,
//           status: apt.status,
//           reasonForVisit: apt.reasonForVisit
//         }))
//       };
//     } catch (error) {
//       console.error('Get doctor appointments error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update appointment status
//    */
//   static async updateAppointmentStatus(appointmentId, status, reason, user) {
//     try {
//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         return {
//           success: false,
//           message: 'Appointment not found'
//         };
//       }

//       appointment.status = status;
//       if (reason) {
//         appointment.cancellationReason = reason;
//       }

//       await appointment.save();

//       return {
//         success: true,
//         message: 'Appointment status updated successfully',
//         appointment: {
//           id: appointment._id,
//           status: appointment.status
//         }
//       };
//     } catch (error) {
//       console.error('Update appointment status error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Cancel an appointment
//    */
//   static async cancelAppointment(appointmentId, user) {
//     try {
//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         return {
//           success: false,
//           message: 'Appointment not found'
//         };
//       }

//       appointment.status = 'cancelled';
//       appointment.cancellationReason = 'Cancelled by patient';
//       await appointment.save();

//       return {
//         success: true,
//         message: 'Appointment cancelled successfully'
//       };
//     } catch (error) {
//       console.error('Cancel appointment error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Send appointment notifications
//    */
//   static async sendAppointmentNotifications(appointment, patient, doctor) {
//     try {
//       // Send notification to patient
//       const patientNotification = new Notification({
//         notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
//         recipientId: patient._id,
//         recipientType: 'patient',
//         message: `Your appointment with Dr. ${doctor.name} has been booked for ${appointment.dateTime.toLocaleDateString()} at ${appointment.dateTime.toLocaleTimeString()}`,
//         type: 'appointment_confirmation',
//         status: 'unread'
//       });
//       await patientNotification.save();

//       // Send notification to doctor
//       const doctorNotification = new Notification({
//         notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
//         recipientId: doctor._id,
//         recipientType: 'doctor',
//         message: `New appointment with ${patient.name} scheduled for ${appointment.dateTime.toLocaleDateString()} at ${appointment.dateTime.toLocaleTimeString()}`,
//         type: 'new_appointment',
//         status: 'unread'
//       });
//       await doctorNotification.save();

//       console.log('Appointment notifications sent successfully');
//     } catch (error) {
//       console.error('Error sending appointment notifications:', error);
//       // Don't throw the error - just log it so appointment booking can continue
//     }
//   }

//   /**
//    * Get appointments pending Health Manager approval
//    */
//   static async getPendingApprovalAppointments() {
//     try {
//       const appointments = await Appointment.find({ 
//         status: 'pending_approval',
//         'approvalWorkflow.approvalStatus': 'pending'
//       })
//       .populate('patientID', 'name email phone')
//       .populate('doctorID', 'name specialization')
//       .sort({ dateTime: 1 });

//       return {
//         success: true,
//         message: 'Pending approval appointments retrieved successfully',
//         appointments: appointments.map(apt => ({
//           id: apt._id,
//           appointmentID: apt.appointmentID,
//           patient: apt.patientID,
//           doctor: apt.doctorID,
//           dateTime: apt.dateTime,
//           reasonForVisit: apt.reasonForVisit,
//           department: apt.appointmentDetails?.location?.department,
//           consultationFee: apt.consultationFee,
//           requestedDate: apt.approvalWorkflow.requestedDate
//         }))
//       };
//     } catch (error) {
//       console.error('Get pending approval appointments error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Approve an appointment (Health Manager only)
//    */
//   static async approveAppointment(appointmentId, approvalNotes, user) {
//     try {
//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         return {
//           success: false,
//           message: 'Appointment not found'
//         };
//       }

//       if (appointment.status !== 'pending_approval') {
//         return {
//           success: false,
//           message: 'Only pending appointments can be approved'
//         };
//       }

//       // Update appointment status
//       appointment.status = 'approved';
//       appointment.approvalWorkflow.approvalStatus = 'approved';
//       appointment.approvalWorkflow.reviewedBy = user._id;
//       appointment.approvalWorkflow.reviewedByName = user.name;
//       appointment.approvalWorkflow.reviewedDate = new Date();
//       appointment.approvalWorkflow.approvalNotes = approvalNotes;

//       await appointment.save();

//       // Send approval notifications
//       await this.sendApprovalNotifications(appointment, 'approved', approvalNotes);

//       return {
//         success: true,
//         message: 'Appointment approved successfully',
//         appointment: {
//           id: appointment._id,
//           appointmentID: appointment.appointmentID,
//           status: appointment.status
//         }
//       };
//     } catch (error) {
//       console.error('Approve appointment error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Decline an appointment (Health Manager only)
//    */
//   static async declineAppointment(appointmentId, declineReason, user) {
//     try {
//       const appointment = await Appointment.findById(appointmentId);
//       if (!appointment) {
//         return {
//           success: false,
//           message: 'Appointment not found'
//         };
//       }

//       if (appointment.status !== 'pending_approval') {
//         return {
//           success: false,
//           message: 'Only pending appointments can be declined'
//         };
//       }

//       // Update appointment status
//       appointment.status = 'declined';
//       appointment.approvalWorkflow.approvalStatus = 'declined';
//       appointment.approvalWorkflow.reviewedBy = user._id;
//       appointment.approvalWorkflow.reviewedByName = user.name;
//       appointment.approvalWorkflow.reviewedDate = new Date();
//       appointment.approvalWorkflow.declineReason = declineReason;

//       await appointment.save();

//       // Send decline notifications
//       await this.sendApprovalNotifications(appointment, 'declined', declineReason);

//       return {
//         success: true,
//         message: 'Appointment declined successfully',
//         appointment: {
//           id: appointment._id,
//           appointmentID: appointment.appointmentID,
//           status: appointment.status
//         }
//       };
//     } catch (error) {
//       console.error('Decline appointment error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Send approval/decline notifications
//    */
//   static async sendApprovalNotifications(appointment, action, notes) {
//     try {
//       // Get patient and doctor details
//       const patient = await Patient.findById(appointment.patientID);
//       const doctor = await Doctor.findById(appointment.doctorID);

//       if (!patient || !doctor) {
//         console.log('Patient or doctor not found for notification');
//         return;
//       }

//       // Send notification to patient
//       const patientNotification = new Notification({
//         notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
//         recipientId: patient._id,
//         recipientType: 'patient',
//         message: `Your appointment with Dr. ${doctor.name} has been ${action}. ${action === 'declined' ? 'Reason: ' + notes : notes ? 'Notes: ' + notes : ''}`,
//         type: `appointment_${action}`,
//         status: 'unread'
//       });
//       await patientNotification.save();

//       // Send notification to doctor
//       const doctorNotification = new Notification({
//         notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
//         recipientId: doctor._id,
//         recipientType: 'doctor',
//         message: `Appointment with ${patient.name} has been ${action} by Health Manager. ${notes ? 'Notes: ' + notes : ''}`,
//         type: `appointment_${action}`,
//         status: 'unread'
//       });
//       await doctorNotification.save();

//       console.log(`Appointment ${action} notifications sent successfully`);
//     } catch (error) {
//       console.error('Error sending approval notifications:', error);
//     }
//   }

//   /**
//    * Get appointments for a specific doctor
//    */
//   static async getDoctorAppointments(doctorId, user) {
//     try {
//       // Check if user is the doctor or has permission
//       if (user.userType !== 'doctor' && user.userType !== 'healthCareManager') {
//         return {
//           success: false,
//           message: 'Access denied'
//         };
//       }

//       // If user is a doctor, only show their own appointments
//       if (user.userType === 'doctor' && user.empID !== doctorId) {
//         return {
//           success: false,
//           message: 'Access denied'
//         };
//       }

//       // Find appointments by both empID and _id to handle different formats
//       console.log(`Doctor ${user.name} (${user.empID}) looking for appointments with doctorID: ${doctorId} or ${user._id}`);
      
//       const appointments = await Appointment.find({
//         $or: [
//           { doctorID: doctorId },
//           { doctorID: user._id.toString() }
//         ]
//       })
//       .sort({ dateTime: -1 });
      
//       console.log(`Found ${appointments.length} appointments for doctor ${user.name}`);

//       return {
//         success: true,
//         message: 'Doctor appointments retrieved successfully',
//         appointments: appointments.map(appointment => ({
//           id: appointment._id,
//           appointmentID: appointment.appointmentID,
//           patient: appointment.patientID,
//           dateTime: appointment.dateTime,
//           status: appointment.status,
//           reasonForVisit: appointment.reasonForVisit,
//           department: appointment.appointmentDetails?.location?.department,
//           consultationFee: appointment.consultationFee,
//           approvalStatus: appointment.approvalWorkflow?.approvalStatus
//         }))
//       };
//     } catch (error) {
//       console.error('Get doctor appointments error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get all appointments for Health Manager
//    */
//   static async getAllAppointmentsForManager(user) {
//     try {
//       console.log(`Getting all appointments for ${user.userType}: ${user.userType}`);
      
//       // Check if user is a health care manager or nurse
//       if (user.userType !== 'healthCareManager' && user.userType !== 'nurse') {
//         return {
//           success: false,
//           message: 'Access denied. Only Health Care Managers and Nurses can access this data.'
//         };
//       }

//       const appointments = await Appointment.find({})
//       .sort({ dateTime: -1 });
      
//       console.log(`Found ${appointments.length} appointments for ${user.userType}`);

//       return {
//         success: true,
//         message: 'All appointments retrieved successfully',
//         appointments: appointments.map(appointment => ({
//           id: appointment._id,
//           appointmentID: appointment.appointmentID,
//           patientID: appointment.patientID,
//           doctorID: appointment.doctorID,
//           dateTime: appointment.dateTime,
//           status: appointment.status,
//           reasonForVisit: appointment.reasonForVisit,
//           department: appointment.appointmentDetails?.location?.department,
//           consultationFee: appointment.consultationFee,
//           approvalStatus: appointment.approvalWorkflow?.approvalStatus,
//           requestedDate: appointment.approvalWorkflow?.requestedDate,
//           paymentStatus: appointment.paymentStatus,
//           paymentMethod: appointment.paymentMethod,
//           createdAt: appointment.createdAt,
//           updatedAt: appointment.updatedAt
//         }))
//       };
//     } catch (error) {
//       console.error('Get all appointments for manager error:', error);
//       throw error;
//     }
//   }

//   /**
//    * Send payment confirmation notifications
//    */
//   static async sendPaymentConfirmationNotifications(appointment) {
//     try {
//       const patient = await Patient.findById(appointment.patientID);
//       const doctor = await Doctor.findById(appointment.doctorID);

//       // Send payment confirmation to patient
//       const paymentNotification = new Notification({
//         notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
//         recipientId: patient._id,
//         recipientType: 'patient',
//         message: `Payment confirmed for your appointment with Dr. ${doctor.name}. Appointment is now confirmed.`,
//         type: 'payment_confirmation',
//         status: 'unread'
//       });
//       await paymentNotification.save();

//       console.log('Payment confirmation notifications sent successfully');
//     } catch (error) {
//       console.error('Error sending payment confirmation notifications:', error);
//     }
//   }
// }

// export default AppointmentController;

export class AppointmentController {
  constructor(appointmentService, availabilityService, paymentService) {
    this.appointmentService = appointmentService;
    this.availabilityService = availabilityService;
    this.paymentService = paymentService;
  }

  async getDepartments(req, res) {
    try {
      const departments = [
        { id: 'cardiology', name: 'Cardiology', description: 'Heart and cardiovascular care', icon: 'heart', color: 'red' },
        { id: 'neurology', name: 'Neurology', description: 'Brain and nervous system care', icon: 'brain', color: 'blue' },
        { id: 'orthopedics', name: 'Orthopedics', description: 'Bone and joint care', icon: 'bone', color: 'green' },
        { id: 'pediatrics', name: 'Pediatrics', description: 'Children\'s healthcare', icon: 'baby', color: 'yellow' },
        { id: 'emergency', name: 'Emergency Medicine', description: 'Urgent care and emergencies', icon: 'ambulance', color: 'red' }
      ];

      res.json({ success: true, message: 'Departments retrieved successfully', departments });
    } catch (error) {
      console.error('Get departments error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getDoctorsByDepartment(req, res) {
    try {
      const { department } = req.params;
      const result = await this.appointmentService.getDoctorsByDepartment(department);
      res.json(result);
    } catch (error) {
      console.error('Get doctors error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getAvailableSlots(req, res) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }

      const slots = await this.appointmentService.getAvailableSlots(doctorId, date);
      res.json({ success: true, slots });
    } catch (error) {
      console.error('Get available slots error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async reserveSlot(req, res) {
    try {
      const result = await this.appointmentService.reserveSlot(req.body);
      res.json(result);
    } catch (error) {
      console.error('Reserve slot error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async bookAppointment(req, res) {
    try {
      const appointment = await this.appointmentService.bookAppointment(req.body, req.user);
      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: {
          id: appointment._id,
          appointmentID: appointment.appointmentID,
          status: appointment.status,
          dateTime: appointment.dateTime,
          consultationFee: appointment.consultationFee
        }
      });
    } catch (error) {
      console.error('Book appointment error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async processPayment(req, res) {
    try {
      const { id } = req.params;
      const { paymentMethod, amount, paymentDetails } = req.body;

      const paymentResult = await this.paymentService.processPayment(paymentMethod, amount, paymentDetails);

      if (!paymentResult.success) {
        return res.status(400).json(paymentResult);
      }

      res.json({ success: true, message: 'Payment processed successfully', transactionId: paymentResult.transactionId });
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
  }

  async getPatientAppointments(req, res) {
    try {
      const { patientId } = req.params;
      const appointments = await this.appointmentService.getPatientAppointments(patientId);
      res.json({ success: true, appointments });
    } catch (error) {
      console.error('Get patient appointments error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getDoctorAppointments(req, res) {
    try {
      const { doctorId } = req.params;
      const appointments = await this.appointmentService.getDoctorAppointments(doctorId, req.user);
      res.json({ success: true, appointments });
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const result = await this.appointmentService.updateAppointmentStatus(id, status, reason, req.user);
      res.json(result);
    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      await this.appointmentService.cancelAppointment(id, req.user);
      res.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPendingApprovalAppointments(req, res) {
    try {
      const appointments = await this.appointmentService.getPendingApprovalAppointments();
      res.json({ success: true, appointments });
    } catch (error) {
      console.error('Get pending approval error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async approveAppointment(req, res) {
    try {
      const { id } = req.params;
      const { approvalNotes } = req.body;
      const appointment = await this.appointmentService.approveAppointment(id, req.user._id, req.user.name, approvalNotes);
      res.json({ success: true, message: 'Appointment approved successfully', appointment });
    } catch (error) {
      console.error('Approve appointment error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async declineAppointment(req, res) {
    try {
      const { id } = req.params;
      const { declineReason } = req.body;
      const appointment = await this.appointmentService.declineAppointment(id, req.user._id, req.user.name, declineReason);
      res.json({ success: true, message: 'Appointment declined successfully', appointment });
    } catch (error) {
      console.error('Decline appointment error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllAppointmentsForManager(req, res) {
    try {
      const appointments = await this.appointmentService.getAllAppointmentsForManager(req.user);
      res.json({ success: true, appointments });
    } catch (error) {
      console.error('Get all appointments error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default AppointmentController;
