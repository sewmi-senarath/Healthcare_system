import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { PatientRoute, AuthorityRoute, DoctorRoute, NurseRoute, HealthCareManagerRoute, PharmacistRoute, SystemAdminRoute } from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import AuthSelection from './pages/AuthSelection';
import PatientLogin from './pages/PatientLogin';
import PatientSignup from './pages/PatientSignup';
import AuthorityLogin from './pages/AuthorityLogin';
import AuthoritySignup from './pages/AuthoritySignup';
import PatientDashboard from './pages/PatientDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AuthorityProfile from './pages/AuthorityProfile';
import AuthorityPatientRecords from './pages/AuthorityPatientRecords';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import HealthcareManagerDashboard from './pages/HealthcareManagerDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import BookAppointment from './pages/BookAppointment';
import SupportTickets from './pages/SupportTickets';
import PatientProfile from './pages/PatientProfile';
import MedicalRecords from './pages/MedicalRecords';
import AppointmentsPage from './pages/AppointmentsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import NotificationsPage from './pages/NotificationsPage';

// Unauthorized page
const Unauthorized = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-8">Access Denied</p>
      <p className="text-gray-500">You don't have permission to access this page.</p>
    </div>
  </div>
);

// 404 page
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
      <p className="text-gray-500">The page you're looking for doesn't exist.</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <AuthSelection />
                </ProtectedRoute>
              } 
            />
            
            {/* Authentication Routes */}
            <Route 
              path="/auth/patient/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <PatientLogin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth/patient/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <PatientSignup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth/authority/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <AuthorityLogin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/auth/authority/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <AuthoritySignup />
                </ProtectedRoute>
              } 
            />

            {/* Patient Routes */}
            <Route 
              path="/patient/dashboard" 
              element={
                <PatientRoute>
                  <PatientDashboard />
                </PatientRoute>
              } 
            />
            <Route 
              path="/patient/book-appointment" 
              element={
                <PatientRoute>
                  <BookAppointment />
                </PatientRoute>
              } 
            />
            <Route 
              path="/patient/support-tickets" 
              element={
                <PatientRoute>
                  <SupportTickets />
                </PatientRoute>
              } 
            />
            <Route 
              path="/patient/profile" 
              element={
                <PatientRoute>
                  <PatientProfile />
                </PatientRoute>
              } 
            />
            <Route 
              path="/patient/medical-records" 
              element={
                <PatientRoute>
                  <MedicalRecords />
                </PatientRoute>
              } 
            />
            <Route 
              path="/patient/prescriptions" 
              element={
                <PatientRoute>
                  <PrescriptionsPage />
                </PatientRoute>
              } 
            />
            <Route 
              path="/patient/notifications" 
              element={
                <PatientRoute>
                  <NotificationsPage />
                </PatientRoute>
              } 
            />

              {/* Authority Routes */}
              <Route 
                path="/authority/dashboard" 
                element={
                  <AuthorityRoute>
                    <AuthorityDashboard />
                  </AuthorityRoute>
                } 
              />
              <Route 
                path="/doctor/dashboard" 
                element={
                  <DoctorRoute>
                    <DoctorDashboard />
                  </DoctorRoute>
                } 
              />
              <Route 
                path="/nurse/dashboard" 
                element={
                  <NurseRoute>
                    <NurseDashboard />
                  </NurseRoute>
                } 
              />
              <Route 
                path="/healthcare-manager/dashboard" 
                element={
                  <HealthCareManagerRoute>
                    <HealthcareManagerDashboard />
                  </HealthCareManagerRoute>
                } 
              />
              <Route 
                path="/pharmacist/dashboard" 
                element={
                  <PharmacistRoute>
                    <PharmacistDashboard />
                  </PharmacistRoute>
                } 
              />
              <Route 
                path="/system-admin/dashboard" 
                element={
                  <SystemAdminRoute>
                    <SystemAdminDashboard />
                  </SystemAdminRoute>
                } 
              />
              <Route 
                path="/authority/appointments" 
                element={
                  <AuthorityRoute>
                    <AppointmentsPage />
                  </AuthorityRoute>
                } 
              />
              <Route 
                path="/authority/prescriptions" 
                element={
                  <AuthorityRoute>
                    <PrescriptionsPage />
                  </AuthorityRoute>
                } 
              />
              <Route 
                path="/authority/profile" 
                element={
                  <AuthorityRoute>
                    <AuthorityProfile />
                  </AuthorityRoute>
                } 
              />
              <Route 
                path="/authority/notifications" 
                element={
                  <AuthorityRoute>
                    <NotificationsPage />
                  </AuthorityRoute>
                } 
              />
              <Route 
                path="/authority/patients" 
                element={
                  <AuthorityRoute>
                    <AuthorityPatientRecords />
                  </AuthorityRoute>
                } 
              />
              <Route 
                path="/authority/medical-records" 
                element={
                  <AuthorityRoute>
                    <MedicalRecords />
                  </AuthorityRoute>
                } 
              />
              <Route 
                path="/authority/support-tickets" 
                element={
                  <AuthorityRoute>
                    <SupportTickets />
                  </AuthorityRoute>
                } 
              />

            {/* Utility Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
