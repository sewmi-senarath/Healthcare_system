import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import authorityAPI from '../utils/authorityAPI';
import PatientSearch from '../components/PatientSearch';
import { 
  CalendarIcon, 
  DocumentTextIcon, 
  TicketIcon, 
  BellIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  HeartIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AuthorityDashboard = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Load dashboard data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load dashboard statistics
        const statsResult = await authorityAPI.getDashboardStats(userType, user._id);
        if (statsResult.success) {
          setDashboardStats(statsResult.stats);
        } else {
          console.log('No dashboard stats found, using defaults');
          setDashboardStats({});
        }

        // Load recent activity
        const activityResult = await authorityAPI.getRecentActivity(userType, user._id);
        if (activityResult.success) {
          setRecentActivity(activityResult.activities || []);
        } else {
          console.log('No recent activity found, using empty array');
          setRecentActivity([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Don't show error toast, just use default values
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

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    toast.success(`Selected patient: ${patient.name}`);
    // You can add more logic here to navigate to patient details or perform actions
  };

  const handlePatientSearchClose = () => {
    setShowPatientSearch(false);
    setSelectedPatient(null);
  };

  const getRoleIcon = (type) => {
    switch (type) {
      case 'doctor':
        return UserIcon;
      case 'pharmacist':
        return BeakerIcon;
      case 'nurse':
        return HeartIcon;
      case 'healthCareManager':
        return ClipboardDocumentListIcon;
      case 'systemAdmin':
        return CogIcon;
      default:
        return ShieldCheckIcon;
    }
  };

  const getRoleTitle = (type) => {
    switch (type) {
      case 'doctor':
        return 'Doctor Dashboard';
      case 'pharmacist':
        return 'Pharmacist Dashboard';
      case 'nurse':
        return 'Nurse Dashboard';
      case 'healthCareManager':
        return 'Healthcare Manager Dashboard';
      case 'systemAdmin':
        return 'System Admin Dashboard';
      default:
        return 'Authority Dashboard';
    }
  };

  const getDashboardCards = (type) => {
    const commonCards = [
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

    switch (type) {
      case 'doctor':
        return [
          {
            title: 'Appointments',
            description: 'Manage patient appointments',
            icon: CalendarIcon,
            color: 'bg-blue-500',
            href: '/authority/appointments'
          },
          {
            title: 'Patients',
            description: 'View and manage patient records',
            icon: UserIcon,
            color: 'bg-green-500',
            href: '/authority/patients'
          },
          {
            title: 'Prescriptions',
            description: 'Create and manage prescriptions',
            icon: DocumentTextIcon,
            color: 'bg-purple-500',
            href: '/authority/prescriptions'
          },
          ...commonCards
        ];
      case 'pharmacist':
        return [
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
          ...commonCards
        ];
      case 'nurse':
        return [
          {
            title: 'Patient Search',
            description: 'Search and scan patient cards',
            icon: MagnifyingGlassIcon,
            color: 'bg-purple-500',
            onClick: () => setShowPatientSearch(true)
          },
          {
            title: 'Appointments',
            description: 'View patient appointments',
            icon: CalendarIcon,
            color: 'bg-blue-500',
            href: '/authority/appointments'
          },
          {
            title: 'Patients',
            description: 'Manage patient care',
            icon: HeartIcon,
            color: 'bg-pink-500',
            href: '/authority/patients'
          },
          {
            title: 'Medical Records',
            description: 'Update patient information',
            icon: DocumentTextIcon,
            color: 'bg-green-500',
            href: '/authority/medical-records'
          },
          ...commonCards
        ];
      case 'healthCareManager':
        return [
          {
            title: 'Appointments',
            description: 'Review and approve appointments',
            icon: CalendarIcon,
            color: 'bg-blue-500',
            href: '/authority/appointments'
          },
          {
            title: 'Support Tickets',
            description: 'Manage support requests',
            icon: TicketIcon,
            color: 'bg-orange-500',
            href: '/authority/support-tickets'
          },
          {
            title: 'Reports',
            description: 'View system reports and analytics',
            icon: ChartBarIcon,
            color: 'bg-green-500',
            href: '/authority/reports'
          },
          {
            title: 'Staff Management',
            description: 'Manage staff and permissions',
            icon: UserIcon,
            color: 'bg-purple-500',
            href: '/authority/staff'
          },
          ...commonCards
        ];
      case 'systemAdmin':
        return [
          {
            title: 'User Management',
            description: 'Manage all system users',
            icon: UserIcon,
            color: 'bg-blue-500',
            href: '/authority/users'
          },
          {
            title: 'System Settings',
            description: 'Configure system settings',
            icon: CogIcon,
            color: 'bg-gray-500',
            href: '/authority/settings'
          },
          {
            title: 'Reports',
            description: 'View system reports and analytics',
            icon: ChartBarIcon,
            color: 'bg-green-500',
            href: '/authority/reports'
          },
          {
            title: 'Support Tickets',
            description: 'Manage all support requests',
            icon: TicketIcon,
            color: 'bg-orange-500',
            href: '/authority/support-tickets'
          },
          ...commonCards
        ];
      default:
        return [
          {
            title: 'Dashboard',
            description: 'View system overview',
            icon: ChartBarIcon,
            color: 'bg-blue-500',
            href: '/authority/overview'
          },
          ...commonCards
        ];
    }
  };

  const getQuickStats = (type) => {
    switch (type) {
      case 'doctor':
        return [
          { label: 'Today\'s Appointments', value: loading ? '...' : (dashboardStats.todaysAppointments || 0), icon: CalendarIcon, color: 'text-blue-600' },
          { label: 'Total Appointments', value: loading ? '...' : (dashboardStats.totalAppointments || 0), icon: CalendarIcon, color: 'text-indigo-600' },
          { label: 'Pending Approval', value: loading ? '...' : (dashboardStats.pendingApprovalAppointments || 0), icon: ClockIcon, color: 'text-orange-600' },
          { label: 'Upcoming (7 days)', value: loading ? '...' : (dashboardStats.upcomingAppointments || 0), icon: CalendarIcon, color: 'text-green-600' },
          { label: 'Completed', value: loading ? '...' : (dashboardStats.completedAppointments || 0), icon: CheckCircleIcon, color: 'text-green-600' },
          { label: 'Active Patients', value: loading ? '...' : (dashboardStats.activePatients || 0), icon: UserIcon, color: 'text-purple-600' },
          { label: 'Pending Prescriptions', value: loading ? '...' : (dashboardStats.pendingPrescriptions || 0), icon: DocumentTextIcon, color: 'text-yellow-600' },
          { label: 'Notifications', value: loading ? '...' : (dashboardStats.unreadNotifications || 0), icon: BellIcon, color: 'text-red-600' }
        ];
      case 'pharmacist':
        return [
          { label: 'Low Stock Items', value: loading ? '...' : (dashboardStats.lowStockMedicines || 0), icon: BeakerIcon, color: 'text-red-600' },
          { label: 'Pending Prescriptions', value: loading ? '...' : (dashboardStats.pendingPrescriptions || 0), icon: DocumentTextIcon, color: 'text-purple-600' },
          { label: 'Total Medicines', value: loading ? '...' : (dashboardStats.totalMedicines || 0), icon: BeakerIcon, color: 'text-green-600' },
          { label: 'Notifications', value: loading ? '...' : (dashboardStats.unreadNotifications || 0), icon: BellIcon, color: 'text-red-600' }
        ];
      case 'nurse':
        return [
          { label: 'Today\'s Appointments', value: loading ? '...' : (dashboardStats.todaysAppointments || 0), icon: CalendarIcon, color: 'text-blue-600' },
          { label: 'Total Appointments', value: loading ? '...' : (dashboardStats.totalAppointments || 0), icon: CalendarIcon, color: 'text-indigo-600' },
          { label: 'Assigned Patients', value: loading ? '...' : (dashboardStats.assignedPatients || 0), icon: HeartIcon, color: 'text-pink-600' },
          { label: 'Notifications', value: loading ? '...' : (dashboardStats.unreadNotifications || 0), icon: BellIcon, color: 'text-red-600' }
        ];
      case 'healthCareManager':
        return [
          { label: 'Pending Approvals', value: loading ? '...' : (dashboardStats.pendingApprovals || 0), icon: CalendarIcon, color: 'text-orange-600' },
          { label: 'Active Tickets', value: loading ? '...' : (dashboardStats.activeTickets || 0), icon: TicketIcon, color: 'text-red-600' },
          { label: 'Total Staff', value: loading ? '...' : (dashboardStats.totalStaff || 0), icon: UserIcon, color: 'text-green-600' },
          { label: 'Notifications', value: loading ? '...' : (dashboardStats.unreadNotifications || 0), icon: BellIcon, color: 'text-red-600' }
        ];
      default:
        return [
          { label: 'Active Users', value: loading ? '...' : (dashboardStats.activeUsers || 0), icon: UserIcon, color: 'text-blue-600' },
          { label: 'Today\'s Activity', value: loading ? '...' : (dashboardStats.todaysActivity || 0), icon: ChartBarIcon, color: 'text-green-600' },
          { label: 'System Health', value: loading ? '...' : (dashboardStats.systemHealth || '99%'), icon: ShieldCheckIcon, color: 'text-green-600' },
          { label: 'Notifications', value: loading ? '...' : (dashboardStats.unreadNotifications || 0), icon: BellIcon, color: 'text-red-600' }
        ];
    }
  };

  const RoleIcon = getRoleIcon(userType);
  const dashboardCards = getDashboardCards(userType);
  const quickStats = getQuickStats(userType);

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
              <RoleIcon className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">{getRoleTitle(userType)}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                {userType}
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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-green-100 text-lg">
            Manage your healthcare responsibilities and access system tools.
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
                  const IconComponent = activity.icon === 'CalendarIcon' ? CalendarIcon : 
                                       activity.icon === 'DocumentTextIcon' ? DocumentTextIcon : 
                                       activity.icon === 'TicketIcon' ? TicketIcon : 
                                       activity.icon === 'BellIcon' ? BellIcon : 
                                       activity.icon === 'BeakerIcon' ? BeakerIcon : BellIcon;
                  
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
                <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">No recent activity</p>
                <p className="text-sm text-gray-400">
                  {userType === 'doctor' 
                    ? 'Your recent appointments and prescriptions will appear here.'
                    : userType === 'healthCareManager'
                    ? 'Your recent approvals and support tickets will appear here.'
                    : 'Your recent activities will appear here.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Patient Search Modal */}
      {showPatientSearch && (
        <PatientSearch
          onPatientSelect={handlePatientSelect}
          onClose={handlePatientSearchClose}
        />
      )}
    </div>
  );
};

export default AuthorityDashboard;
