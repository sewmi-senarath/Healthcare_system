import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  TicketIcon, 
  BellIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import patientAPI from '../utils/patientAPI';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({
    upcomingAppointments: 0,
    medicalRecords: 0,
    activePrescriptions: 0,
    unreadNotifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load dashboard statistics
        const statsResult = await patientAPI.getDashboardStats();
        if (statsResult.success) {
          setDashboardStats(statsResult.stats);
        }

        // Load recent activity
        const activityResult = await patientAPI.getRecentActivity();
        if (activityResult.success) {
          setRecentActivity(activityResult.activities);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  const dashboardCards = [
    {
      title: 'Book Appointment',
      description: 'Book a new appointment with a doctor',
      icon: CalendarIcon,
      color: 'bg-blue-500',
      href: '/patient/book-appointment'
    },
    {
      title: 'Medical Records',
      description: 'View your medical history and records',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      href: '/patient/medical-records'
    },
    {
      title: 'Prescriptions',
      description: 'Track your current prescriptions',
      icon: HeartIcon,
      color: 'bg-purple-500',
      href: '/patient/prescriptions'
    },
    {
      title: 'Support Tickets',
      description: 'Raise and track support requests',
      icon: TicketIcon,
      color: 'bg-orange-500',
      href: '/patient/support-tickets'
    },
    {
      title: 'Notifications',
      description: 'View your notifications and updates',
      icon: BellIcon,
      color: 'bg-red-500',
      href: '/patient/notifications'
    },
    {
      title: 'Profile',
      description: 'Manage your personal information',
      icon: UserIcon,
      color: 'bg-indigo-500',
      href: '/patient/profile'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <HeartIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-blue-100 text-lg">
            Access your medical information and manage your healthcare needs.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : dashboardStats.upcomingAppointments}
                </p>
                <p className="text-gray-600">Upcoming Appointments</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <DocumentTextIcon className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : dashboardStats.medicalRecords}
                </p>
                <p className="text-gray-600">Medical Records</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <HeartIcon className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : dashboardStats.activePrescriptions}
                </p>
                <p className="text-gray-600">Active Prescriptions</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <BellIcon className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : dashboardStats.unreadNotifications}
                </p>
                <p className="text-gray-600">New Notifications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  navigate(card.href);
                }}
              >
                <div className="flex items-center mb-4">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon === 'CalendarIcon' ? CalendarIcon : 
                                       activity.icon === 'HeartIcon' ? HeartIcon : 
                                       activity.icon === 'BellIcon' ? BellIcon : BellIcon;
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
