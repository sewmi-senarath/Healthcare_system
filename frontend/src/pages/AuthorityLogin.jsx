import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { handleAPIError } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  UserIcon,
  HeartIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const AuthorityLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/authority/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (!selectedRole) {
        toast.error('Please select your role');
        return;
      }

      const result = await login(data.email, data.password, selectedRole);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      handleAPIError(error);
    }
  };

  const authorityRoles = [
    {
      type: 'doctor',
      title: 'Doctor',
      icon: UserIcon,
      description: 'Manage patients, prescriptions, and appointments',
      color: 'text-blue-600'
    },
    {
      type: 'pharmacist',
      title: 'Pharmacist',
      icon: BeakerIcon,
      description: 'Manage medicine stock and dispense prescriptions',
      color: 'text-green-600'
    },
    {
      type: 'nurse',
      title: 'Nurse',
      icon: HeartIcon,
      description: 'Provide patient care and manage medical records',
      color: 'text-pink-600'
    },
    {
      type: 'hospitalStaff',
      title: 'Hospital Staff',
      icon: UserGroupIcon,
      description: 'Handle administrative tasks and patient services',
      color: 'text-purple-600'
    },
    {
      type: 'healthCareManager',
      title: 'Healthcare Manager',
      icon: ClipboardDocumentListIcon,
      description: 'Oversee operations and manage staff',
      color: 'text-orange-600'
    },
    {
      type: 'systemAdmin',
      title: 'System Admin',
      icon: CogIcon,
      description: 'System administration and user management',
      color: 'text-red-600'
    }
  ];

  if (loading) {
    return <LoadingSpinner text="Signing you in..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Role Selection
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Authority Login
              </h1>
              <p className="text-gray-600">
                Sign in to access your staff dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  id="email"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>


              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/auth/forgot-password"
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Selected Role Indicator */}
              {selectedRole && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 font-medium">
                      Selected: {authorityRoles.find(role => role.type === selectedRole)?.title}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedRole}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : selectedRole ? 'Sign In' : 'Select Role First'}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/auth/authority/signup"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>

          {/* Authority Roles Selection */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Select Your Role
            </h2>
            <div className="space-y-4">
              {authorityRoles.map((role, index) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole === role.type;
                return (
                  <div 
                    key={index} 
                    onClick={() => setSelectedRole(role.type)}
                    className={`flex items-start space-x-3 p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-green-50 border-2 border-green-500 shadow-md' 
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isSelected ? 'text-green-600' : role.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
                        {role.title}
                      </h3>
                      <p className={`text-sm ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Security Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Role-based access control</li>
                <li>• Secure authentication</li>
                <li>• Encrypted data transmission</li>
                <li>• Audit trail logging</li>
                <li>• Session management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Secure authority portal powered by Healthcare System
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthorityLogin;
