import Appointment from '../models/Appointment.js';
import Notification from '../models/Notification.js';

/**
 * AppointmentPaymentController - Handles appointment payment processing
 * Following Single Responsibility Principle - Only handles payment-related operations
 */
class AppointmentPaymentController {
  /**
   * Process payment for an appointment
   * @param {string} appointmentId 
   * @param {Object} paymentData 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  static async processPayment(appointmentId, paymentData, user) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('patientID', 'name email phone')
        .populate('doctorID', 'name specialization department');

      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found'
        };
      }

      if (appointment.paymentStatus === 'completed') {
        return {
          success: false,
          message: 'Payment already completed for this appointment'
        };
      }

      // Simulate payment processing
      const paymentResult = await this.simulatePayment(
        paymentData.method,
        paymentData.amount,
        {
          appointmentId: appointment.appointmentID,
          patientName: appointment.patientID.name,
          doctorName: appointment.doctorID.name,
          amount: paymentData.amount
        }
      );

      if (paymentResult.success) {
        // Update appointment payment status
        appointment.paymentStatus = 'completed';
        appointment.paymentMethod = paymentData.method;
        appointment.paymentAmount = paymentData.amount;
        appointment.paymentTransactionId = paymentResult.transactionId;
        appointment.paidAt = new Date();
        appointment.lastUpdatedBy = user.userType === 'patient' ? user.patientId : user.empID;
        appointment.lastUpdatedAt = new Date();

        await appointment.save();

        // Send payment confirmation notifications
        await this.sendPaymentConfirmationNotifications(appointment);

        return {
          success: true,
          message: 'Payment processed successfully',
          paymentResult: paymentResult,
          appointment: appointment
        };
      } else {
        return {
          success: false,
          message: 'Payment processing failed',
          error: paymentResult.error
        };
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: 'Failed to process payment'
      };
    }
  }

  /**
   * Simulate payment processing
   * @param {string} method 
   * @param {number} amount 
   * @param {Object} details 
   * @returns {Promise<Object>}
   */
  static async simulatePayment(method, amount, details) {
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate different payment methods
      let success = true;
      let error = null;

      switch (method.toLowerCase()) {
        case 'credit_card':
        case 'debit_card':
          // 95% success rate for cards
          success = Math.random() > 0.05;
          break;
        case 'paypal':
          // 98% success rate for PayPal
          success = Math.random() > 0.02;
          break;
        case 'bank_transfer':
          // 90% success rate for bank transfer
          success = Math.random() > 0.1;
          break;
        default:
          success = Math.random() > 0.03;
      }

      if (success) {
        const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        return {
          success: true,
          transactionId: transactionId,
          amount: amount,
          method: method,
          status: 'completed',
          timestamp: new Date(),
          details: details
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed',
          method: method,
          amount: amount,
          details: details
        };
      }
    } catch (error) {
      console.error('Error simulating payment:', error);
      return {
        success: false,
        error: 'Payment simulation failed'
      };
    }
  }

  /**
   * Send payment confirmation notifications
   * @param {Object} appointment 
   * @returns {Promise<void>}
   */
  static async sendPaymentConfirmationNotifications(appointment) {
    try {
      // Notification for patient
      const patientNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.patientID.patientId,
        recipientType: 'patient',
        title: 'Payment Confirmed',
        message: `Payment of $${appointment.paymentAmount} for your appointment with Dr. ${appointment.doctorID.name} has been confirmed.`,
        type: 'payment_confirmation',
        status: 'unread',
        priority: 'high',
        data: {
          appointmentId: appointment.appointmentID,
          doctorName: appointment.doctorID.name,
          appointmentDate: appointment.dateTime,
          amount: appointment.paymentAmount,
          transactionId: appointment.paymentTransactionId,
          paymentMethod: appointment.paymentMethod
        },
        createdAt: new Date()
      });

      await patientNotification.save();

      // Notification for doctor
      const doctorNotification = new Notification({
        notificationId: `NOTIF${Date.now()}${Math.random().toString(36).substring(2, 4)}`,
        recipientId: appointment.doctorID.empID,
        recipientType: 'doctor',
        title: 'Payment Received',
        message: `Payment of $${appointment.paymentAmount} has been received for your appointment with ${appointment.patientID.name}.`,
        type: 'payment_confirmation',
        status: 'unread',
        priority: 'medium',
        data: {
          appointmentId: appointment.appointmentID,
          patientName: appointment.patientID.name,
          appointmentDate: appointment.dateTime,
          amount: appointment.paymentAmount,
          transactionId: appointment.paymentTransactionId,
          paymentMethod: appointment.paymentMethod
        },
        createdAt: new Date()
      });

      await doctorNotification.save();

      console.log(`Payment confirmation notifications sent for appointment ${appointment.appointmentID}`);
    } catch (error) {
      console.error('Error sending payment confirmation notifications:', error);
    }
  }
}

export default AppointmentPaymentController;
