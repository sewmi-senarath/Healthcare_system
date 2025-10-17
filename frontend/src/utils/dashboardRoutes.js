// Helper function to get the correct dashboard route based on user type
export const getDashboardRoute = (userType) => {
  switch (userType) {
    case 'patient':
      return '/patient/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    case 'nurse':
      return '/nurse/dashboard';
    case 'healthCareManager':
      return '/healthcare-manager/dashboard';
    case 'pharmacist':
      return '/pharmacist/dashboard';
    case 'systemAdmin':
      return '/system-admin/dashboard';
    default:
      return '/authority/dashboard';
  }
};
