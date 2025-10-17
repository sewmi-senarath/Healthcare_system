/**
 * ValidationHelper - Utility for input validation
 */
export class ValidationHelper {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone);
  }

  static validateDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  static validateRequired(fields, data) {
    const missing = [];
    
    fields.forEach(field => {
      if (!data[field] || data[field] === '') {
        missing.push(field);
      }
    });

    return {
      isValid: missing.length === 0,
      missingFields: missing
    };
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000); // Limit length
  }
}