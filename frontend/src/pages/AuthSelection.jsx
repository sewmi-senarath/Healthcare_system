import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  HeartIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';

const AuthSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mx-auto mb-6">
            <HeartIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Healthcare System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your role to access our comprehensive healthcare management platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Patient Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
              <HeartIcon className="w-8 h-8 text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Patient Portal
            </h2>
            
            <p className="text-gray-600 text-center mb-8">
              Access your medical records, book appointments, manage prescriptions, and raise support tickets.
            </p>

            <div className="space-y-4">
              <Link
                to="/auth/patient/login"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
              >
                <UserIcon className="w-5 h-5 mr-2" />
                Patient Login
              </Link>
              
              <Link
                to="/auth/patient/signup"
                className="w-full border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center"
              >
                Patient Signup
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p className="font-semibold mb-2">Patient Features:</p>
              <ul className="space-y-1">
                <li>• Book and manage appointments</li>
                <li>• View medical records</li>
                <li>• Track prescriptions</li>
                <li>• Raise support tickets</li>
                <li>• View notifications</li>
              </ul>
            </div>
          </div>

          {/* Authority Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Authority Portal
            </h2>
            
            <p className="text-gray-600 text-center mb-8">
              Access staff dashboard for doctors, nurses, pharmacists, and healthcare managers.
            </p>

            <div className="space-y-4">
              <Link
                to="/auth/authority/login"
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
              >
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Authority Login
              </Link>
              
              <Link
                to="/auth/authority/signup"
                className="w-full border-2 border-green-600 text-green-600 py-3 px-6 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200 flex items-center justify-center"
              >
                Authority Signup
              </Link>
            </div>

            <div className="mt-6 text-sm text-gray-500">
              <p className="font-semibold mb-2">Authority Roles:</p>
              <ul className="space-y-1">
                <li>• <span className="font-medium">Doctor:</span> Manage patients, prescriptions</li>
                <li>• <span className="font-medium">Pharmacist:</span> Manage medicine stock</li>
                <li>• <span className="font-medium">Nurse:</span> Patient care management</li>
                <li>• <span className="font-medium">Healthcare Manager:</span> System oversight</li>
                <li>• <span className="font-medium">Hospital Staff:</span> Administrative tasks</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@healthcare.com" className="text-blue-600 hover:underline">
              support@healthcare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSelection;
