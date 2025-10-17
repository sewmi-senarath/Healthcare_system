import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AuthorityProfile = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      specialization: user?.specialization || '',
      department: user?.department || '',
      experience: user?.experience || '',
      licenseNumber: user?.licenseNumber || ''
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        specialization: user.specialization || '',
        department: user.department || '',
        experience: user.experience || '',
        licenseNumber: user.licenseNumber || ''
      });
    }
  }, [user, reset]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/', { replace: true });
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Here you would typically make an API call to update the profile
      // For now, we'll just simulate success
      console.log('Profile update data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getRoleIcon = (type) => {
    switch (type) {
      case 'doctor':
        return UserIcon;
      case 'nurse':
        return UserIcon;
      case 'pharmacist':
        return UserIcon;
      case 'healthCareManager':
        return ShieldCheckIcon;
      case 'systemAdmin':
        return ShieldCheckIcon;
      default:
        return UserIcon;
    }
  };

  const getRoleTitle = (type) => {
    switch (type) {
      case 'doctor':
        return 'Doctor';
      case 'nurse':
        return 'Nurse';
      case 'pharmacist':
        return 'Pharmacist';
      case 'healthCareManager':
        return 'Healthcare Manager';
      case 'systemAdmin':
        return 'System Administrator';
      default:
        return 'Authority';
    }
  };

  const RoleIcon = getRoleIcon(userType);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <RoleIcon className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {getRoleTitle(userType)} Profile
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
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
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                    {user?.name || 'Not provided'}
                  </div>
                )}
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-400" />
                    {user?.email || 'Not provided'}
                  </div>
                )}
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <PhoneIcon className="w-5 h-5 mr-2 text-gray-400" />
                    {user?.phone || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your address"
                  />
                ) : (
                  <div className="flex items-center text-gray-900">
                    <MapPinIcon className="w-5 h-5 mr-2 text-gray-400" />
                    {user?.address || 'Not provided'}
                  </div>
                )}
              </div>

              {/* Role-specific fields */}
              {(userType === 'doctor' || userType === 'pharmacist') && (
                <>
                  {/* Specialization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {userType === 'doctor' ? 'Specialization' : 'Area of Expertise'}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        {...register('specialization')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter your ${userType === 'doctor' ? 'specialization' : 'area of expertise'}`}
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                        {user?.specialization || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        {...register('department')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your department"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                        {user?.department || 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        {...register('experience')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter years of experience"
                        min="0"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
                        {user?.experience ? `${user.experience} years` : 'Not provided'}
                      </div>
                    )}
                  </div>

                  {/* License Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        {...register('licenseNumber')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your license number"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <ShieldCheckIcon className="w-5 h-5 mr-2 text-gray-400" />
                        {user?.licenseNumber || 'Not provided'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckIcon className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default AuthorityProfile;
