/**
 * Register Page
 * User registration with email, password, and profile information
 */

import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail, calculatePasswordStrength } from '../../utils/security.utils';
import type { VehicleType } from '../../types/auth.types';

const VEHICLE_TYPES: { value: VehicleType; label: string; icon: string }[] = [
  { value: 'motorcycle', label: 'Motorcycle', icon: '🏍️' },
  { value: 'car', label: 'Car', icon: '🚗' },
  { value: 'truck', label: 'Truck', icon: '🚚' },
  { value: 'other', label: 'Other', icon: '🚙' },
];

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: 'Weak' | 'Fair' | 'Good' | 'Strong'; feedback: string[]; meetsMinimum: boolean }>({ score: 0, label: 'Weak', feedback: [], meetsMinimum: false });

  // Calculate password strength on change
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    }
  }, [password]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!displayName) {
      errors.displayName = 'Display name is required';
    } else if (displayName.length < 3) {
      errors.displayName = 'Display name must be at least 3 characters';
    } else if (displayName.length > 20) {
      errors.displayName = 'Display name must not exceed 20 characters';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (!passwordStrength.meetsMinimum) {
      errors.password = 'Password does not meet minimum requirements';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email,
        password,
        display_name: displayName,
        vehicle_type: vehicleType,
      });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.score) {
      case 0:
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-blue-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">SpeedLink</h1>
          <p className="text-gray-400">Create your account</p>
        </div>

        {/* Registration Form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.email;
                    return newErrors;
                  });
                }}
                className={`w-full px-4 py-3 bg-gray-700 border ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Display Name Field */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.displayName;
                    return newErrors;
                  });
                }}
                className={`w-full px-4 py-3 bg-gray-700 border ${
                  fieldErrors.displayName ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="John Rider"
                disabled={isLoading}
                maxLength={20}
              />
              {fieldErrors.displayName && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.displayName}</p>
              )}
            </div>

            {/* Vehicle Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setVehicleType(type.value)}
                    className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                      vehicleType === type.value
                        ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                        : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                    disabled={isLoading}
                  >
                    <span className="text-2xl mr-2">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      return newErrors;
                    });
                  }}
                  className={`w-full px-4 py-3 bg-gray-700 border ${
                    fieldErrors.password ? 'border-red-500' : 'border-gray-600'
                  } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Password Strength:</span>
                    <span className={`font-medium ${
                      passwordStrength.score <= 1 ? 'text-red-400' :
                      passwordStrength.score === 2 ? 'text-yellow-400' :
                      passwordStrength.score === 3 ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      {passwordStrength.feedback.slice(0, 3).map((msg, i) => (
                        <li key={i}>• {msg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.confirmPassword;
                    return newErrors;
                  });
                }}
                className={`w-full px-4 py-3 bg-gray-700 border ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
