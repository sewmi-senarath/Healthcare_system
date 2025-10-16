import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { PatientRoute, AuthorityRoute } from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import AuthSelection from './pages/AuthSelection';
import PatientLogin from './pages/PatientLogin';
import PatientSignup from './pages/PatientSignup';
import AuthorityLogin from './pages/AuthorityLogin';
import AuthoritySignup from './pages/AuthoritySignup';
import PatientDashboard from './pages/PatientDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';

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

            {/* Authority Routes */}
            <Route 
              path="/authority/dashboard" 
              element={
                <AuthorityRoute>
                  <AuthorityDashboard />
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
