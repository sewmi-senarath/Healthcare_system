import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute } from '../utils/dashboardRoutes';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthorityDashboard = () => {
  const { userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the appropriate dashboard based on user type
    if (userType) {
      const dashboardRoute = getDashboardRoute(userType);
      navigate(dashboardRoute, { replace: true });
    }
  }, [userType, navigate]);

  return <LoadingSpinner text="Redirecting to your dashboard..." />;
};

export default AuthorityDashboard;
