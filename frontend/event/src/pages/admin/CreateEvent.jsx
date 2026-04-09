import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AdminCreateEvent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    venue: '',
    date: '',
    time: '',
    duration: '',
    category: '',
    assignedFaculty: [],
    description: '',
    registrationFees: 0,
    prize: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [facultyList, setFacultyList] = useState([]);

  const categories = ['hackathon', 'seminar', 'workshop', 'cultural', 'sports', 'technical', 'other'];

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get('/faculty');
        setFacultyList(res.data?.data || res.data || []);
      } catch (err) {
        console.error('Error fetching faculty:', err);
      }
    };
    fetchFaculty();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions, (opt) => opt.value);
      setFormData((prev) => ({ ...prev, [name]: values }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.prize.trim()) newErrors.prize = 'Prize information is required';
    if (formData.registrationFees < 0) newErrors.registrationFees = 'Fees cannot be negative';

    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) newErrors.date = 'Event date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastMessage(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...formData, role: 'admin' };
      const response = await api.post('/events/create', payload);

      if (response.data.success) {
        setToastMessage({ type: 'success', text: 'Event successfully created and auto-approved!' });
        setFormData({ name: '', venue: '', date: '', time: '', duration: '', category: '', assignedFaculty: [], description: '', registrationFees: 0, prize: '' });
        window.scrollTo(0, 0);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Server error occurred while creating event.';
      setToastMessage({ type: 'error', text: errorMsg });
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (field) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none
     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
     placeholder-gray-400 dark:placeholder-gray-500
     ${errors[field]
       ? 'border-red-500 dark:border-red-500 focus:ring-2 focus:ring-red-500/30'
       : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20'
     }`;

  const labelClasses = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8 animate-fade-in">
      {/* Back Button & Title */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/events')}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Event</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Admin-created events are auto-approved.</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden">
        {/* Gradient Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Event Details
          </h3>
        </div>

        <div className="p-6 md:p-8">
          {/* Toast */}
          {toastMessage && (
            <div className={`mb-6 px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium ${
              toastMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {toastMessage.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="ml-4 opacity-60 hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Event Name */}
              <div>
                <label htmlFor="admin-name" className={labelClasses}>Event Name <span className="text-red-500">*</span></label>
                <input type="text" id="admin-name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Annual Tech Symposium" className={inputClasses('name')} />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Venue */}
              <div>
                <label htmlFor="admin-venue" className={labelClasses}>Venue <span className="text-red-500">*</span></label>
                <input type="text" id="admin-venue" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" className={inputClasses('venue')} />
                {errors.venue && <p className="mt-1 text-xs text-red-500">{errors.venue}</p>}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="admin-date" className={labelClasses}>Date <span className="text-red-500">*</span></label>
                <input type="date" id="admin-date" name="date" value={formData.date} onChange={handleChange} className={inputClasses('date')} />
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label htmlFor="admin-time" className={labelClasses}>Time <span className="text-red-500">*</span></label>
                <input type="time" id="admin-time" name="time" value={formData.time} onChange={handleChange} className={inputClasses('time')} />
                {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="admin-duration" className={labelClasses}>Duration <span className="text-red-500">*</span></label>
                <input type="text" id="admin-duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 2 Hours, 1 Day" className={inputClasses('duration')} />
                {errors.duration && <p className="mt-1 text-xs text-red-500">{errors.duration}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="admin-category" className={labelClasses}>Category <span className="text-red-500">*</span></label>
                <select id="admin-category" name="category" value={formData.category} onChange={handleChange} className={inputClasses('category')}>
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
              </div>
              
              {/* Registration Fees */}
              <div>
                <label htmlFor="admin-fees" className={labelClasses}>Registration Fees <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                  <input type="number" id="admin-fees" name="registrationFees" value={formData.registrationFees} onChange={handleChange} min="0" placeholder="0 for free" className={`${inputClasses('registrationFees')} pl-8`} />
                </div>
                {errors.registrationFees && <p className="mt-1 text-xs text-red-500">{errors.registrationFees}</p>}
              </div>

              {/* Prize */}
              <div>
                <label htmlFor="admin-prize" className={labelClasses}>Prize/Reward <span className="text-red-500">*</span></label>
                <input type="text" id="admin-prize" name="prize" value={formData.prize} onChange={handleChange} placeholder="e.g. ₹5000 + Certificate" className={inputClasses('prize')} />
                {errors.prize && <p className="mt-1 text-xs text-red-500">{errors.prize}</p>}
              </div>

              {/* Assigned Faculty */}
              <div className="md:col-span-2">
                <label htmlFor="admin-faculty" className={labelClasses}>Assigned Faculty <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span></label>
                <select
                  multiple
                  id="admin-faculty"
                  name="assignedFaculty"
                  value={formData.assignedFaculty}
                  onChange={handleChange}
                  className={`${inputClasses('assignedFaculty')} min-h-[120px]`}
                >
                  {facultyList.length === 0 ? (
                    <option disabled>No faculty found</option>
                  ) : (
                    facultyList.map((f) => (
                      <option key={f._id} value={f._id}>{f.name || f.email}</option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Hold Ctrl/Cmd to select multiple</p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="admin-description" className={labelClasses}>Description <span className="text-red-500">*</span></label>
                <textarea
                  id="admin-description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide detailed event description..."
                  className={inputClasses('description')}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/events')}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Saving...
                  </>
                ) : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateEvent;
