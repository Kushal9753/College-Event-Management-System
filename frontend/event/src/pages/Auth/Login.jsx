import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FormWrapper from '../../components/layout/FormWrapper';
import { loginFields } from './loginConfig';
import authService from '../../services/auth';

const Login = () => {
  const navigate = useNavigate();
  
  const initialState = loginFields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name, value) => {
    const fieldConfig = loginFields.find(f => f.name === name);
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

    loginFields.forEach(field => {
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
      // Standard login handles all roles now
      const userData = await authService.login(
        formData.identifier, 
        formData.password
      );
      
      navigate(`/${userData.role}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormWrapper 
      title="Welcome Back" 
      subtitle="Please enter your credentials to access your account"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
        
        {apiError && (
          <div className="p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm text-center">
            {apiError}
          </div>
        )}

        <div className="space-y-4">
          {loginFields.map((field) => (
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
            Sign in
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Register
          </Link>
        </p>
      </form>
    </FormWrapper>
  );
};

export default Login;
