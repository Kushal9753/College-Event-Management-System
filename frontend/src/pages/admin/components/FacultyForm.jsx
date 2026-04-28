import React, { useState, useEffect } from 'react';
import { departments, expertiseAreas } from '../../../services/facultyService';
import { X, Loader2 } from 'lucide-react';

const emptyForm = { name: '', email: '', phone: '', department: '', expertise: '', collegeName: '' };

const FacultyForm = ({ isOpen, onClose, onSubmit, initialData, isSubmitting }) => {
 const [formData, setFormData] = useState(emptyForm);
 const [errors, setErrors] = useState({});
 const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (initialData) {
          setFormData({
            name: initialData.name || '',
            email: initialData.email || '',
            phone: initialData.phone || '',
            department: initialData.department || '',
            expertise: initialData.expertise || '',
            collegeName: initialData.collegeName || '',
          });
        } else {
          setFormData(emptyForm);
        }
        setErrors({});
      }, 0);
    }
  }, [initialData, isOpen]);

 const validate = () => {
 const newErrors = {};
 if (!formData.name.trim()) newErrors.name = 'Name is required';
 if (!formData.email.trim()) newErrors.email = 'Email is required';
 else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
 if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
 else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Must be 10 digits';
 if (!formData.department) newErrors.department = 'Select a department';
 if (!formData.expertise) newErrors.expertise = 'Select expertise';
 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 if (!validate()) return;
 onSubmit(formData);
 };

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

 {/* Modal */}
 <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in">
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 ">
 <h2 className="text-lg font-semibold text-gray-900 ">
 {isEditing ? 'Edit Faculty' : 'Add Faculty'}
 </h2>
 <button
 onClick={onClose}
 className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Form */}
 <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
 {/* Name */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
 <input
 name="name"
 value={formData.name}
 onChange={handleChange}
 placeholder="Dr. John Doe"
 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
 errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
 }`}
 />
 {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
 </div>

 {/* Email */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
 <input
 name="email"
 type="email"
 value={formData.email}
 onChange={handleChange}
 placeholder="john@college.edu"
 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
 errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
 }`}
 />
 {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
 </div>

 {/* Phone */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
 <input
 name="phone"
 value={formData.phone}
 onChange={handleChange}
 placeholder="9876543210"
 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
 errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
 }`}
 />
 {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
 </div>

 {/* Department */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
 <select
 name="department"
 value={formData.department}
 onChange={handleChange}
 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
 errors.department ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
 }`}
 >
 <option value="">Select department</option>
 {departments.map(d => <option key={d} value={d}>{d}</option>)}
 </select>
 {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
 </div>

 {/* Expertise */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Expertise</label>
 <select
 name="expertise"
 value={formData.expertise}
 onChange={handleChange}
 className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
 errors.expertise ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
 }`}
 >
 <option value="">Select expertise</option>
 {expertiseAreas.map(e => <option key={e} value={e}>{e}</option>)}
 </select>
 {errors.expertise && <p className="mt-1 text-xs text-red-500">{errors.expertise}</p>}
 </div>

 {/* College */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
 <input
 name="collegeName"
 value={formData.collegeName}
 onChange={handleChange}
 placeholder="College Name"
 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
 />
 </div>

 {/* Buttons */}
 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center justify-center"
 >
 {isSubmitting ? (
 <Loader2 className="animate-spin h-5 w-5 text-white" />
 ) : isEditing ? 'Update' : 'Add Faculty'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default FacultyForm;
