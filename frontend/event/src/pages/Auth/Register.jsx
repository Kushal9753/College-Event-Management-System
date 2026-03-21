import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FormWrapper from '../../components/layout/FormWrapper';
import { registerFields } from './registerConfig';
import authService from '../../services/auth';

const Register = () => {
  const navigate = useNavigate();
  
  // Initialize form state from config
  const initialState = registerFields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate a single field
  const validateField = (name, value) => {
    const fieldConfig = registerFields.find(f => f.name === name);
    if (fieldConfig?.validation) {
      return fieldConfig.validation(value, formData);
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setApiError('');

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    let isValid = true;
    const newErrors = {};

    registerFields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    setApiError('');

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        collegeName: formData.collegeName,
        enrollmentNumber: formData.enrollmentNumber,
        password: formData.password,
      });

      // Redirect to student dashboard after successful registration
      navigate('/student');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper 
      title="Create Account" 
      subtitle="Register as a student to get started"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        
        {/* Global API Error */}
        {apiError && (
          <div className="p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm text-center">
            {apiError}
          </div>
        )}

        {/* Dynamically render form fields based on configuration */}
        <div className="space-y-4">
          {registerFields.map((field) => (
            <Input
              key={field.name}
              id={field.name}
              name={field.name}
              type={field.type}
              label={field.label}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors[field.name]}
              disabled={isLoading}
              required={field.required}
            />
          ))}
        </div>

        <div>
          <Button 
            type="submit" 
            isLoading={isLoading}
            disabled={Object.values(errors).some(e => e !== null) || isLoading}
          >
            Register
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </form>
    </FormWrapper>
  );
};

export default Register;
