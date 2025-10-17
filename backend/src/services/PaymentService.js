/**
 * PaymentService - Single Responsibility: Handle ALL payment operations
 */
export class PaymentService {
  async processPayment(method, amount, details) {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      return {
        success: true,
        transactionId: `TXN${Date.now()}`,
        message: 'Payment successful'
      };
    } else {
      return {
        success: false,
        message: 'Payment declined by bank'
      };
    }
  }

  async refundPayment(transactionId, amount) {
    // Refund logic
    return {
      success: true,
      refundId: `REF${Date.now()}`,
      amount: amount
    };
  }

  calculateRefundEligibility(appointmentTime) {
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
    return hoursUntilAppointment > 24;
  }
}