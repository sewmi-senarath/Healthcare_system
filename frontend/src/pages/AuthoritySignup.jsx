import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
  UserIcon,
  HeartIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const AuthoritySignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState('');
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const password = watch('password');

  const userTypes = [
    {
      value: 'doctor',
      label: 'Doctor',
      icon: UserIcon,
      description: 'Manage patients, prescriptions, and appointments',
      color: 'border-blue-300 bg-blue-50 text-blue-700',
      selectedColor: 'border-blue-500 bg-blue-100'
    },
    {
      value: 'pharmacist',
      label: 'Pharmacist',
      icon: BeakerIcon,
      description: 'Manage medicine stock and dispense prescriptions',
      color: 'border-green-300 bg-green-50 text-green-700',
      selectedColor: 'border-green-500 bg-green-100'
    },
    {
      value: 'nurse',
      label: 'Nurse',
      icon: HeartIcon,
      description: 'Provide patient care and manage medical records',
      color: 'border-pink-300 bg-pink-50 text-pink-700',
      selectedColor: 'border-pink-500 bg-pink-100'
    },
    {
      value: 'hospitalStaff',
      label: 'Hospital Staff',
      icon: UserGroupIcon,
      description: 'Handle administrative tasks and patient services',
      color: 'border-purple-300 bg-purple-50 text-purple-700',
      selectedColor: 'border-purple-500 bg-purple-100'
    },
    {
      value: 'healthCareManager',
      label: 'Healthcare Manager',
      icon: ClipboardDocumentListIcon,
      description: 'Oversee operations and manage staff',
      color: 'border-orange-300 bg-orange-50 text-orange-700',
      selectedColor: 'border-orange-500 bg-orange-100'
    },
    {
      value: 'systemAdmin',
      label: 'System Admin',
      icon: CogIcon,
      description: 'System administration and user management',
      color: 'border-red-300 bg-red-50 text-red-700',
      selectedColor: 'border-red-500 bg-red-100'
    }
  ];

  const onSubmit = async (data) => {
    try {
      if (!selectedUserType) {
        toast.error('Please select your role');
        return;
      }

      // Prepare authority data based on selected type
      const authorityData = {
        userType: selectedUserType,
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        empID: data.empID,
        assignedHospitalID: data.assignedHospitalID || '',
        department: data.department,
        position: data.position,
        salary: data.salary || 0,
        hireDate: data.hireDate,
        ...getRoleSpecificData(selectedUserType, data)
      };

      console.log('Authority registration data:', authorityData);
      const result = await registerUser(authorityData, true);
      
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/authority/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      handleAPIError(error);
    }
  };

  const getRoleSpecificData = (userType, data) => {
    switch (userType) {
      case 'doctor':
        return {
          specialization: data.specialization,
          licenseNumber: data.licenseNumber || '',
          phone: data.phone || '',
          preferredCommunicationMethod: data.preferredCommunicationMethod || 'email',
          consultationFee: data.consultationFee || 0
        };
      case 'pharmacist':
        return {
          licenseNumber: data.licenseNumber,
          assignedPharmacy: {
            pharmacyId: data.pharmacyId,
            pharmacyName: data.pharmacyName,
            address: data.pharmacyAddress || '',
            phone: data.pharmacyPhone || ''
          }
        };
      case 'healthCareManager':
        return {
          assignedHospital: {
            hospitalId: data.hospitalId,
            hospitalName: data.hospitalName,
            address: data.hospitalAddress || '',
            phone: data.hospitalPhone || ''
          }
        };
      case 'nurse':
        return {
          assignedWard: data.assignedWard,
          nursingLicense: {
            licenseNumber: data.nursingLicenseNumber
          }
        };
      case 'hospitalStaff':
        return {
          role: data.role,
          assignedDepartment: data.assignedDepartment
        };
      default:
        return {};
    }
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', met: password && password.length >= 6 },
    { label: 'Contains uppercase letter', met: password && /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', met: password && /[a-z]/.test(password) },
    { label: 'Contains number', met: password && /\d/.test(password) }
  ];

  if (loading) {
    return <LoadingSpinner text="Creating your account..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Role Selection
        </Link>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authority Registration
            </h1>
            <p className="text-gray-600">
              Create your staff account to access the healthcare system
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Select Your Role *
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {userTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isSelected = selectedUserType === type.value;
                  return (
                    <div
                      key={type.value}
                      onClick={() => setSelectedUserType(type.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? type.selectedColor : type.color
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-6 h-6" />
                        <div>
                          <h3 className="font-semibold">{type.label}</h3>
                          <p className="text-sm opacity-75">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  id="name"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
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
            </div>

            {/* Employee ID and Hospital ID */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Employee ID */}
              <div>
                <label htmlFor="empID" className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID *
                </label>
                <input
                  {...register('empID', {
                    required: 'Employee ID is required',
                    minLength: {
                      value: 3,
                      message: 'Employee ID must be at least 3 characters'
                    }
                  })}
                  type="text"
                  id="empID"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.empID ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your employee ID"
                />
                {errors.empID && (
                  <p className="mt-1 text-sm text-red-600">{errors.empID.message}</p>
                )}
              </div>

              {/* Hospital ID (for most roles) */}
              {selectedUserType && selectedUserType !== 'systemAdmin' && (
                <div>
                  <label htmlFor="assignedHospitalID" className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital ID *
                  </label>
                  <input
                    {...register('assignedHospitalID', {
                      required: selectedUserType !== 'systemAdmin' ? 'Hospital ID is required' : false
                    })}
                    type="text"
                    id="assignedHospitalID"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.assignedHospitalID ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter hospital ID"
                  />
                  {errors.assignedHospitalID && (
                    <p className="mt-1 text-sm text-red-600">{errors.assignedHospitalID.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Department and Position */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  {...register('department', {
                    required: 'Department is required',
                    minLength: {
                      value: 2,
                      message: 'Department must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Department must be less than 50 characters'
                    }
                  })}
                  type="text"
                  id="department"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.department ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your department"
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              {/* Position */}
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  {...register('position', {
                    required: 'Position is required',
                    minLength: {
                      value: 2,
                      message: 'Position must be at least 2 characters'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Position must be less than 50 characters'
                    }
                  })}
                  type="text"
                  id="position"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your position"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                )}
              </div>
            </div>

            {/* Salary and Hire Date */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Salary */}
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-2">
                  Salary ($)
                </label>
                <input
                  {...register('salary', {
                    min: {
                      value: 0,
                      message: 'Salary must be a positive number'
                    }
                  })}
                  type="number"
                  id="salary"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Enter salary (optional)"
                  min="0"
                  step="0.01"
                />
                {errors.salary && (
                  <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                )}
              </div>

              {/* Hire Date */}
              <div>
                <label htmlFor="hireDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Hire Date *
                </label>
                <input
                  {...register('hireDate', {
                    required: 'Hire date is required'
                  })}
                  type="date"
                  id="hireDate"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                {errors.hireDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.hireDate.message}</p>
                )}
              </div>
            </div>

            {/* Role-specific fields */}
            {selectedUserType === 'doctor' && (
              <div className="space-y-6">
                {/* Specialization and License Number */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <select
                      {...register('specialization', {
                        required: 'Specialization is required'
                      })}
                      id="specialization"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select specialization</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                      <option value="oncology">Oncology</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="surgery">Surgery</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="psychiatry">Psychiatry</option>
                      <option value="radiology">Radiology</option>
                      <option value="anesthesiology">Anesthesiology</option>
                      <option value="emergency_medicine">Emergency Medicine</option>
                      <option value="family_medicine">Family Medicine</option>
                      <option value="internal_medicine">Internal Medicine</option>
                      <option value="gynecology">Gynecology</option>
                      <option value="urology">Urology</option>
                      <option value="ophthalmology">Ophthalmology</option>
                      <option value="otolaryngology">Otolaryngology</option>
                      <option value="pathology">Pathology</option>
                      <option value="pulmonology">Pulmonology</option>
                    </select>
                    {errors.specialization && (
                      <p className="mt-1 text-sm text-red-600">{errors.specialization.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      License Number *
                    </label>
                    <input
                      {...register('licenseNumber', {
                        required: 'License number is required'
                      })}
                      type="text"
                      id="licenseNumber"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter license number"
                    />
                    {errors.licenseNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.licenseNumber.message}</p>
                    )}
                  </div>
                </div>

                {/* Consultation Fee */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="consultationFee" className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Fee ($) *
                    </label>
                    <input
                      {...register('consultationFee', {
                        required: 'Consultation fee is required',
                        min: {
                          value: 0,
                          message: 'Consultation fee must be a positive number'
                        }
                      })}
                      type="number"
                      id="consultationFee"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter consultation fee"
                      min="0"
                      step="0.01"
                    />
                    {errors.consultationFee && (
                      <p className="mt-1 text-sm text-red-600">{errors.consultationFee.message}</p>
                    )}
                  </div>
                  <div>
                    {/* Empty div for layout */}
                  </div>
                </div>

                {/* Phone and Preferred Communication */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Please provide a valid phone number'
                        }
                      })}
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="+1234567890"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="preferredCommunicationMethod" className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Communication *
                    </label>
                    <select
                      {...register('preferredCommunicationMethod', {
                        required: 'Preferred communication method is required'
                      })}
                      id="preferredCommunicationMethod"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select communication method</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                    </select>
                    {errors.preferredCommunicationMethod && (
                      <p className="mt-1 text-sm text-red-600">{errors.preferredCommunicationMethod.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedUserType === 'pharmacist' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    License Number *
                  </label>
                  <input
                    {...register('licenseNumber', {
                      required: 'License number is required'
                    })}
                    type="text"
                    id="licenseNumber"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.licenseNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter license number"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="pharmacyId" className="block text-sm font-medium text-gray-700 mb-2">
                      Pharmacy ID *
                    </label>
                    <input
                      {...register('pharmacyId', {
                        required: 'Pharmacy ID is required'
                      })}
                      type="text"
                      id="pharmacyId"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter pharmacy ID"
                    />
                  </div>
                  <div>
                    <label htmlFor="pharmacyName" className="block text-sm font-medium text-gray-700 mb-2">
                      Pharmacy Name *
                    </label>
                    <input
                      {...register('pharmacyName', {
                        required: 'Pharmacy name is required'
                      })}
                      type="text"
                      id="pharmacyName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter pharmacy name"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedUserType === 'healthCareManager' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital ID *
                    </label>
                    <input
                      {...register('hospitalId', {
                        required: 'Hospital ID is required'
                      })}
                      type="text"
                      id="hospitalId"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter hospital ID"
                    />
                  </div>
                  <div>
                    <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700 mb-2">
                      Hospital Name *
                    </label>
                    <input
                      {...register('hospitalName', {
                        required: 'Hospital name is required'
                      })}
                      type="text"
                      id="hospitalName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter hospital name"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedUserType === 'nurse' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="assignedWard" className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Ward *
                    </label>
                    <select
                      {...register('assignedWard', {
                        required: 'Assigned ward is required'
                      })}
                      id="assignedWard"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select ward</option>
                      <option value="emergency">Emergency</option>
                      <option value="icu">ICU</option>
                      <option value="ccu">CCU</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="maternity">Maternity</option>
                      <option value="surgery">Surgery</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                      <option value="oncology">Oncology</option>
                      <option value="psychiatry">Psychiatry</option>
                      <option value="geriatrics">Geriatrics</option>
                      <option value="rehabilitation">Rehabilitation</option>
                      <option value="outpatient">Outpatient</option>
                      <option value="day_surgery">Day Surgery</option>
                    </select>
                    {errors.assignedWard && (
                      <p className="mt-1 text-sm text-red-600">{errors.assignedWard.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="nursingLicenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Nursing License Number *
                    </label>
                    <input
                      {...register('nursingLicenseNumber', {
                        required: 'Nursing license number is required'
                      })}
                      type="text"
                      id="nursingLicenseNumber"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder="Enter nursing license number"
                    />
                    {errors.nursingLicenseNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.nursingLicenseNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedUserType === 'hospitalStaff' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                      Staff Role *
                    </label>
                    <select
                      {...register('role', {
                        required: 'Staff role is required'
                      })}
                      id="role"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select role</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="administrator">Administrator</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="clerk">Clerk</option>
                      <option value="technician">Technician</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="security">Security</option>
                      <option value="janitorial">Janitorial</option>
                      <option value="food_service">Food Service</option>
                      <option value="transportation">Transportation</option>
                      <option value="billing_specialist">Billing Specialist</option>
                    </select>
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="assignedDepartment" className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Department *
                    </label>
                    <select
                      {...register('assignedDepartment', {
                        required: 'Assigned department is required'
                      })}
                      id="assignedDepartment"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select department</option>
                      <option value="emergency">Emergency</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="neurology">Neurology</option>
                      <option value="oncology">Oncology</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="surgery">Surgery</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="psychiatry">Psychiatry</option>
                      <option value="radiology">Radiology</option>
                      <option value="laboratory">Laboratory</option>
                      <option value="pharmacy">Pharmacy</option>
                      <option value="administration">Administration</option>
                      <option value="billing">Billing</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="food_service">Food Service</option>
                      <option value="transportation">Transportation</option>
                      <option value="security">Security</option>
                      <option value="housekeeping">Housekeeping</option>
                    </select>
                    {errors.assignedDepartment && (
                      <p className="mt-1 text-sm text-red-600">{errors.assignedDepartment.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Password Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
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
                    placeholder="Create a password"
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors pr-12 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={index} className="flex items-center text-sm">
                      {req.met ? (
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <XMarkIcon className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={req.met ? 'text-green-700' : 'text-red-700'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                {...register('terms', {
                  required: 'You must accept the terms and conditions'
                })}
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-green-600 hover:text-green-700">
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-green-600 hover:text-green-700">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedUserType}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/auth/authority/login"
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthoritySignup;
