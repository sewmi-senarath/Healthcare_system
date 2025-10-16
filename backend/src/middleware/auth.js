import jwt from 'jsonwebtoken';
import { User, Patient, Doctor, HospitalStaff, Nurse, Pharmacist, HealthCareManager, SystemAdmin } from '../models/index.js';

/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Generate JWT access token
 * @param {Object} payload - User data to include in token
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to include in refresh token
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

/**
 * Verify JWT access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify JWT refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

/**
 * Authentication middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Find user based on role
    let user;
    const userType = decoded.userType;
    const userId = decoded.userId;

    switch (userType) {
      case 'patient':
        user = await Patient.findOne({ patientId: userId });
        break;
      case 'doctor':
        user = await Doctor.findOne({ empID: userId });
        break;
      case 'hospitalStaff':
        user = await HospitalStaff.findOne({ empID: userId });
        break;
      case 'nurse':
        user = await Nurse.findOne({ empID: userId });
        break;
      case 'pharmacist':
        user = await Pharmacist.findOne({ empID: userId });
        break;
      case 'healthCareManager':
        user = await HealthCareManager.findOne({ empID: userId });
        break;
      case 'systemAdmin':
        user = await SystemAdmin.findOne({ empID: userId });
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid user type'
        });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach user to request object
    req.user = user;
    req.userType = userType;
    req.userId = userId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  }
};

/**
 * Role-based authorization middleware
 * @param {Array} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userType) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is patient
 */
export const requirePatient = authorizeRoles(['patient']);

/**
 * Middleware to check if user is authority (any staff member)
 */
export const requireAuthority = authorizeRoles(['doctor', 'hospitalStaff', 'nurse', 'pharmacist', 'healthCareManager', 'systemAdmin']);

/**
 * Middleware to check if user is doctor
 */
export const requireDoctor = authorizeRoles(['doctor']);

/**
 * Middleware to check if user is pharmacist
 */
export const requirePharmacist = authorizeRoles(['pharmacist']);

/**
 * Middleware to check if user is health care manager
 */
export const requireHealthCareManager = authorizeRoles(['healthCareManager']);

/**
 * Middleware to check if user is system admin
 */
export const requireSystemAdmin = authorizeRoles(['systemAdmin']);

/**
 * Middleware to check if user is nurse or doctor
 */
export const requireMedicalStaff = authorizeRoles(['doctor', 'nurse']);

/**
 * Middleware to check if user can manage appointments
 */
export const requireAppointmentAccess = authorizeRoles(['patient', 'doctor', 'healthCareManager', 'systemAdmin']);

/**
 * Middleware to check if user can manage prescriptions
 */
export const requirePrescriptionAccess = authorizeRoles(['doctor', 'pharmacist', 'healthCareManager', 'systemAdmin']);

/**
 * Middleware to check if user can manage support tickets
 */
export const requireSupportTicketAccess = authorizeRoles(['patient', 'healthCareManager', 'systemAdmin']);

/**
 * Middleware to check if user can manage medicine stock
 */
export const requireMedicineStockAccess = authorizeRoles(['pharmacist', 'healthCareManager', 'systemAdmin']);

/**
 * Optional authentication middleware (doesn't fail if no token)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyAccessToken(token);
      
      // Find user based on role
      let user;
      const userType = decoded.userType;
      const userId = decoded.userId;

      switch (userType) {
        case 'patient':
          user = await Patient.findOne({ patientId: userId });
          break;
        case 'doctor':
          user = await Doctor.findOne({ empID: userId });
          break;
        case 'hospitalStaff':
          user = await HospitalStaff.findOne({ empID: userId });
          break;
        case 'nurse':
          user = await Nurse.findOne({ empID: userId });
          break;
        case 'pharmacist':
          user = await Pharmacist.findOne({ empID: userId });
          break;
        case 'healthCareManager':
          user = await HealthCareManager.findOne({ empID: userId });
          break;
        case 'systemAdmin':
          user = await SystemAdmin.findOne({ empID: userId });
          break;
      }

      if (user) {
        req.user = user;
        req.userType = userType;
        req.userId = userId;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @param {string} userType - Type of user (patient, doctor, etc.)
 * @returns {Object} Object containing access and refresh tokens
 */
export const generateTokenPair = (user, userType) => {
  const userId = userType === 'patient' ? user.patientId : user.empID;
  
  const payload = {
    userId: userId,
    userType: userType,
    email: user.email,
    name: user.name
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRES_IN
  };
};

/**
 * Refresh token middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      userType: decoded.userType,
      email: decoded.email,
      name: decoded.name
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      expiresIn: JWT_EXPIRES_IN
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    } else {
      console.error('Refresh token error:', error);
      return res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }
};

/**
 * Logout middleware (for token blacklisting if needed)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const logout = (req, res, next) => {
  // In a production environment, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
