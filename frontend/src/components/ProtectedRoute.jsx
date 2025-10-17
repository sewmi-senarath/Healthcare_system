import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { getDashboardRoute } from '../utils/dashboardRoutes';

const ProtectedRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { isAuthenticated, userType, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { isAuthenticated, userType, loading, allowedRoles, requireAuth, path: location.pathname });

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated but trying to access login/signup pages
  if (!requireAuth && isAuthenticated) {
    // Redirect to the appropriate dashboard based on user type
    return <Navigate to={getDashboardRoute(userType)} replace />;
  }

  // If specific roles are required, check if user has permission
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Specific route components for different user types
export const PatientRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['patient']}>
    {children}
  </ProtectedRoute>
);

export const AuthorityRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['doctor', 'hospitalStaff', 'nurse', 'pharmacist', 'healthCareManager', 'systemAdmin']}>
    {children}
  </ProtectedRoute>
);

export const DoctorRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['doctor']}>
    {children}
  </ProtectedRoute>
);

export const PharmacistRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['pharmacist']}>
    {children}
  </ProtectedRoute>
);

export const NurseRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['nurse']}>
    {children}
  </ProtectedRoute>
);

export const HealthCareManagerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['healthCareManager']}>
    {children}
  </ProtectedRoute>
);

export const SystemAdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['systemAdmin']}>
    {children}
  </ProtectedRoute>
);

export const AppointmentAccessRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['patient', 'doctor', 'healthCareManager', 'systemAdmin']}>
    {children}
  </ProtectedRoute>
);

export const PrescriptionAccessRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['doctor', 'pharmacist', 'healthCareManager', 'systemAdmin']}>
    {children}
  </ProtectedRoute>
);

export const SupportTicketAccessRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['patient', 'healthCareManager', 'systemAdmin']}>
    {children}
  </ProtectedRoute>
);

export const MedicineStockAccessRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['pharmacist', 'healthCareManager', 'systemAdmin']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
