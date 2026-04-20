import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/auth';

const FacultyLogin = () => {
 const navigate = useNavigate();
 const [formData, setFormData] = useState({ email: '', password: '' });
 const [errors, setErrors] = useState({});
 const [apiError, setApiError] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 const validate = () => {
 const newErrors = {};
 if (!formData.email) newErrors.email = 'Email is required';
 else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
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
 const userData = await authService.login(formData.email, formData.password, 'faculty');
 navigate('/faculty');
 } catch (error) {
 const message = error.response?.data?.message || 'Login failed. Please try again.';
 setApiError(message);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100 py-12 px-4 transition-colors duration-300">
 {/* Subtle background shapes */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none">
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
 <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
 </div>

 <div className="relative max-w-md w-full">
 {/* Card */}
 <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/50 ">
 {/* Header */}
 <div className="text-center mb-8">
 <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
 </svg>
 </div>
 <h2 className="text-2xl font-bold text-gray-900 ">Faculty Portal</h2>
 <p className="mt-1 text-sm text-gray-500 ">Sign in with your institutional email</p>
 </div>

 {apiError && (
 <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
 {apiError}
 </div>
 )}

 <form onSubmit={handleSubmit} noValidate className="space-y-5">
 <Input
 id="faculty-email"
 name="email"
 type="email"
 label="Email Address"
 placeholder="Enter your institutional email"
 value={formData.email}
 onChange={handleChange}
 error={errors.email}
 disabled={isLoading}
 required
 />
 <Input
 id="faculty-password"
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
 className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 hover:!from-emerald-700 hover:!to-teal-700 !shadow-lg !shadow-emerald-500/25"
 >
 Sign In
 </Button>
 </form>

 <div className="mt-6 space-y-3 text-center text-sm">
 <p className="text-gray-500 text-xs italic">
 Faculty accounts are created by administrators.
 <br />Contact your admin if you don't have access.
 </p>
 <div className="flex items-center gap-3">
 <div className="flex-1 h-px bg-gray-200 "></div>
 <span className="text-xs text-gray-400 ">or sign in as</span>
 <div className="flex-1 h-px bg-gray-200 "></div>
 </div>
 <div className="flex gap-3 justify-center">
 <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium hover:underline">
 ← Student
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

export default FacultyLogin;
