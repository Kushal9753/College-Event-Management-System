import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/auth';

const AdminLogin = () => {
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
 const userData = await authService.login(formData.email, formData.password, 'admin');
 navigate('/admin');
 } catch (error) {
 const message = error.response?.data?.message || 'Login failed. Please try again.';
 setApiError(message);
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950 py-12 px-4 transition-colors duration-300">
 {/* Subtle background shapes */}
 <div className="fixed inset-0 overflow-hidden pointer-events-none">
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
 <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
 {/* Grid pattern */}
 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
 </div>

 <div className="relative max-w-md w-full">
 {/* Card */}
 <div className="bg-gray-800/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-700/50">
 {/* Header */}
 <div className="text-center mb-8">
 <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-8 h-8">
 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
 </svg>
 </div>
 <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
 <p className="mt-1 text-sm text-gray-400">Authorized personnel only</p>
 <div className="mt-3 flex items-center justify-center gap-2">
 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
 <span className="text-xs text-amber-500/80 font-medium tracking-wide uppercase">Secure Access</span>
 </div>
 </div>

 {apiError && (
 <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm text-center">
 {apiError}
 </div>
 )}

 <form onSubmit={handleSubmit} noValidate className="space-y-5">
 <div>
 <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
 <input
 id="admin-email"
 name="email"
 type="email"
 placeholder="admin@institution.edu"
 value={formData.email}
 onChange={handleChange}
 disabled={isLoading}
 required
 className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-900/50 text-white placeholder-gray-500 ${
 errors.email
 ? 'border-red-500 focus:ring-red-500'
 : 'border-gray-600 focus:ring-amber-500 focus:border-transparent'
 }`}
 />
 {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
 </div>

 <div>
 <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
 <input
 id="admin-password"
 name="password"
 type="password"
 placeholder="Enter your password"
 value={formData.password}
 onChange={handleChange}
 disabled={isLoading}
 required
 className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-gray-900/50 text-white placeholder-gray-500 ${
 errors.password
 ? 'border-red-500 focus:ring-red-500'
 : 'border-gray-600 focus:ring-amber-500 focus:border-transparent'
 }`}
 />
 {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-amber-500 bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isLoading ? (
 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 ) : null}
 Sign In to Admin Panel
 </button>
 </form>

 <div className="mt-6 text-center">
 <div className="flex items-center gap-3 mb-3">
 <div className="flex-1 h-px bg-gray-700"></div>
 <span className="text-xs text-gray-500">other portals</span>
 <div className="flex-1 h-px bg-gray-700"></div>
 </div>
 <div className="flex gap-3 justify-center text-sm">
 <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
 ← Student
 </Link>
 <span className="text-gray-600">|</span>
 <Link to="/faculty/login" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
 Faculty →
 </Link>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

export default AdminLogin;
