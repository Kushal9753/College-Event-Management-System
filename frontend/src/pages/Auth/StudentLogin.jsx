import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/auth';

const StudentLogin = () => {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({ identifier: '', password: '' });
 const [errors, setErrors] = useState({});
 const [apiError, setApiError] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const validate = () => {
 const newErrors = {};
 if (!formData.identifier) newErrors.identifier = 'Email or Enrollment Number is required';
 else if (formData.identifier.length < 5) newErrors.identifier = 'Must be at least 5 characters';
 if (!formData.password) newErrors.password = 'Password is required';
 else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 setApiError('');
 if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!validate()) return;
 setIsLoading(true);
 setApiError('');
 try {
 const userData = await authService.login(formData.identifier, formData.password, 'student');
 navigate('/student');
 } catch (error) {
 const message = error.response?.data?.message || 'Login failed. Please try again.';
 setApiError(message);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 transition-colors duration-300">
 {/* Subtle background shapes */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none">
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
 <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
 </div>

 <div className="relative max-w-md w-full">
 {/* Card */}
 <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50 ">
 {/* Header */}
 <div className="text-center mb-8">
 <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
 <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
 </svg>
 </div>
 <h2 className="text-2xl font-bold text-gray-900 ">Student Portal</h2>
 <p className="mt-1 text-sm text-gray-500 ">Sign in with your enrollment number or email</p>
 </div>

 {apiError && (
 <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
 {apiError}
 </div>
 )}

 <form onSubmit={handleSubmit} noValidate className="space-y-5">
 <Input
 id="student-identifier"
 name="identifier"
 type="text"
 label="Email / Enrollment Number"
 placeholder="Enter your email or enrollment number"
 value={formData.identifier}
 onChange={handleChange}
 error={errors.identifier}
 disabled={isLoading}
 required
 />
 <Input
 id="student-password"
 name="password"
 type="password"
 label="Password"
 placeholder="Enter your password"
 value={formData.password}
 onChange={handleChange}
 error={errors.password}
 disabled={isLoading}
 required
 />
 <Button
 type="submit"
 isLoading={isLoading}
 disabled={isLoading}
 className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 hover:!to-indigo-700 !shadow-lg !shadow-blue-500/25"
 >
 Sign In
 </Button>
 </form>

 <div className="mt-6 space-y-3 text-center text-sm">
 <p className="text-gray-600 ">
 Don't have an account?{' '}
 <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 ">
 Register here
 </Link>
 </p>
 <div className="flex items-center gap-3">
 <div className="flex-1 h-px bg-gray-200 "></div>
 <span className="text-xs text-gray-400 ">or sign in as</span>
 <div className="flex-1 h-px bg-gray-200 "></div>
 </div>
 <div className="flex gap-3 justify-center">
 <Link to="/faculty/login" className="text-emerald-600 hover:text-emerald-500 font-medium hover:underline">
 Faculty →
 </Link>
 <span className="text-gray-300 ">|</span>
 <Link to="/admin/login" className="text-amber-600 hover:text-amber-500 font-medium hover:underline">
 Admin →
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default StudentLogin;
