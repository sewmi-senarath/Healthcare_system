import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import authorityAPI from '../utils/authorityAPI';
import { 
  DocumentTextIcon, 
  UserIcon,
  BellIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const PharmacistDashboard = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load dashboard statistics
        const statsResult = await authorityAPI.getDashboardStats(userType, user.empID);
        if (statsResult.success && statsResult.stats && Object.keys(statsResult.stats).length > 0) {
          setDashboardStats(statsResult.stats);
        } else {
          console.log('No dashboard stats found');
          setDashboardStats({});
        }

        // Load recent activity
        const activityResult = await authorityAPI.getRecentActivity(userType, user.empID);
        if (activityResult.success) {
          setRecentActivity(activityResult.activities || []);
        } else {
          console.log('No recent activity found, using empty array');
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setDashboardStats({});
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && userType) {
      loadDashboardData();
    }
  }, [user, userType]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  const dashboardCards = [
    {
      title: 'Medicine Stock',
      description: 'Manage medicine inventory',
      icon: BeakerIcon,
      color: 'bg-green-500',
      href: '/authority/medicine-stock'
    },
    {
      title: 'Prescriptions',
      description: 'Process and dispense prescriptions',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
      href: '/authority/prescriptions'
    },
    {
      title: 'Notifications',
      description: 'View your notifications and updates',
      icon: BellIcon,
      color: 'bg-red-500',
      href: '/authority/notifications'
    },
    {
      title: 'Profile',
      description: 'Manage your personal information',
      icon: UserIcon,
      color: 'bg-indigo-500',
      href: '/authority/profile'
    }
  ];

  const quickStats = [
    { label: 'Low Stock Items', value: loading ? '...' : (dashboardStats.lowStockMedicines || 0), icon: BeakerIcon, color: 'text-red-600' },
    { label: 'Pending Prescriptions', value: loading ? '...' : (dashboardStats.pendingPrescriptions || 0), icon: DocumentTextIcon, color: 'text-purple-600' },
    { label: 'Total Medicines', value: loading ? '...' : (dashboardStats.totalMedicines || 0), icon: BeakerIcon, color: 'text-green-600' },
    { label: 'Notifications', value: loading ? '...' : (dashboardStats.unreadNotifications || 0), icon: BellIcon, color: 'text-red-600' }
  ];

  const handleCardClick = (card) => {
    if (card.onClick) {
      card.onClick();
    } else if (card.href) {
      navigate(card.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BeakerIcon className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Pharmacist Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Pharmacist
              </span>
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
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-green-100 text-lg">
            Manage medicine inventory and process prescriptions efficiently.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm border">
                  <div className="flex items-center">
                    <IconComponent className={`w-8 h-8 ${stat.color}`} />
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
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
                onClick={() => handleCardClick(card)}
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
                  const IconComponent = activity.icon === 'DocumentTextIcon' ? DocumentTextIcon : 
                                       activity.icon === 'BeakerIcon' ? BeakerIcon : 
                                       activity.icon === 'BellIcon' ? BellIcon : 
                                       BellIcon;
                  
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
                <BeakerIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">No recent activity</p>
                <p className="text-sm text-gray-400">
                  Your recent prescription and inventory activities will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PharmacistDashboard;
