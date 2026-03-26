import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FormWrapper from '../../components/layout/FormWrapper';
import authService from '../../services/auth';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate password strength on change
  useEffect(() => {
    let score = 0;
    if (password.length > 0) {
      if (password.length >= 8) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;
    }
    setStrength(score);
  }, [password]);

  const validate = () => {
    const newErrors = {};
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (strength < 3) {
      newErrors.password = 'Password is too weak';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!token) {
      setApiError('Invalid or missing reset token.');
      return;
    }

    setIsLoading(true);
    setApiError('');
    setSuccessMsg('');

    try {
      await authService.setPassword(token, password);
      // Show success and redirect
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Strength UI helpers
  const getStrengthColor = () => {
    if (strength === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-yellow-500';
    if (strength >= 4) return 'bg-green-500';
  };
  const getStrengthLabel = () => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Good';
    if (strength >= 4) return 'Strong';
  };

  return (
    <FormWrapper 
      title="Set New Password" 
      subtitle="Please create a strong password for your account"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        
        {/* API Error Message */}
        {apiError && (
          <div className="p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm text-center animate-in fade-in">
            {apiError}
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="p-3 rounded bg-green-100 border border-green-400 text-green-700 text-sm text-center animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* Warning if no token */}
        {!token && !apiError && !successMsg && (
          <div className="p-3 rounded bg-yellow-100 border border-yellow-400 text-yellow-800 text-sm text-center">
            Warning: No token found in URL. You won't be able to submit this form.
          </div>
        )}

        <div className="space-y-4">
          <Input
            id="password"
            name="password"
            type="password"
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            disabled={isLoading || successMsg}
            required
          />

          {/* Password strength indicator */}
          {password.length > 0 && (
            <div className="mt-[-10px] mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Password strength:</span>
                <span className={`text-xs font-semibold ${
                  strength <= 2 ? 'text-red-500' : strength === 3 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {getStrengthLabel()}
                </span>
              </div>
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level} 
                    className={`flex-1 rounded-full transition-colors duration-300 ${
                      strength >= level ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  ></div>
                ))}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                Use 8+ characters with a mix of letters, numbers & symbols
              </div>
            </div>
          )}

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
            }}
            error={errors.confirmPassword}
            disabled={isLoading || successMsg}
            required
          />
        </div>

        <div>
          <Button 
            type="submit" 
            isLoading={isLoading}
            disabled={isLoading || !!successMsg || !token}
          >
            Update Password
          </Button>
        </div>
      </form>
    </FormWrapper>
  );
};

export default SetPassword;
