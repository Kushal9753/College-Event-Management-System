import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const EventForm = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    category: '',
    department: '',
    assigned_faculty: []
  });

  // UI State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null); // { type: 'success' | 'danger', text: '' }
  const [facultyList, setFacultyList] = useState([]);

  // Fetch real faculty list
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get('/faculty');
        setFacultyList(res.data);
      } catch (err) {
        console.error('Error fetching faculty:', err);
      }
    };
    fetchFaculty();
  }, []);

  // Mock data for dropdowns (Ideally fetched from backend API)
  const categories = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar'];
  const departments = ['Engineering', 'Law', 'Pharma', 'Management', 'Arts'];

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    if (type === 'select-multiple') {
      const values = Array.from(selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: values }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validation Logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.start_datetime) newErrors.start_datetime = 'Start date and time are required';
    if (!formData.end_datetime) newErrors.end_datetime = 'End date and time are required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.department) newErrors.department = 'Please select a department';

    // End time > Start time validation
    if (formData.start_datetime && formData.end_datetime) {
      const start = new Date(formData.start_datetime);
      const end = new Date(formData.end_datetime);
      if (end <= start) {
        newErrors.end_datetime = 'End date/time must be after the start date/time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Setup payload matching backend expectations
      const payload = {
        name: formData.name,
        description: formData.description,
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
        location: formData.location,
        category: formData.category,
        department: formData.department,
        assigned_faculty: formData.assigned_faculty,
      };

      // API Call - Ensure your backend has an endpoint to receive this
      // Replace URL with actual API endpoint, e.g. /api/events
      const token = localStorage.getItem('token');

      const response = await api.post('/events/create', payload);

      if (response.data.success) {
        setSubmitMessage({ type: 'success', text: 'Event successfully created!' });
        resetForm();
      } else {
        setSubmitMessage({ type: 'danger', text: 'Failed to create event. Please try again.' });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Server error occurred while creating event.';
      setSubmitMessage({ type: 'danger', text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Form state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_datetime: '',
      end_datetime: '',
      location: '',
      category: '',
      department: '',
      assigned_faculty: []
    });
    setErrors({});
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h4 className="card-title mb-0">Create New Event</h4>
        </div>
        
        <div className="card-body">
          {/* Status Message */}
          {submitMessage && (
            <div className={`alert alert-${submitMessage.type} alert-dismissible fade show`} role="alert">
              {submitMessage.text}
              <button type="button" className="btn-close" onClick={() => setSubmitMessage(null)} aria-label="Close"></button>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            
            {/* Event Name */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-bold">Event Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter event name"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            {/* Description */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label fw-bold">Description <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide event details"
              ></textarea>
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="row">
              {/* Start Date & Time */}
              <div className="col-md-6 mb-3">
                <label htmlFor="start_datetime" className="form-label fw-bold">Start Date & Time <span className="text-danger">*</span></label>
                <input
                  type="datetime-local"
                  className={`form-control ${errors.start_datetime ? 'is-invalid' : ''}`}
                  id="start_datetime"
                  name="start_datetime"
                  value={formData.start_datetime}
                  onChange={handleChange}
                />
                {errors.start_datetime && <div className="invalid-feedback">{errors.start_datetime}</div>}
              </div>

              {/* End Date & Time */}
              <div className="col-md-6 mb-3">
                <label htmlFor="end_datetime" className="form-label fw-bold">End Date & Time <span className="text-danger">*</span></label>
                <input
                  type="datetime-local"
                  className={`form-control ${errors.end_datetime ? 'is-invalid' : ''}`}
                  id="end_datetime"
                  name="end_datetime"
                  value={formData.end_datetime}
                  onChange={handleChange}
                />
                {errors.end_datetime && <div className="invalid-feedback">{errors.end_datetime}</div>}
              </div>
            </div>

            {/* Location */}
            <div className="mb-3">
              <label htmlFor="location" className="form-label fw-bold">Location <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Main Auditorium, Lab 3"
              />
              {errors.location && <div className="invalid-feedback">{errors.location}</div>}
            </div>

            <div className="row">
              {/* Category */}
              <div className="col-md-6 mb-3">
                <label htmlFor="category" className="form-label fw-bold">Category <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>

              {/* Department */}
              <div className="col-md-6 mb-3">
                <label htmlFor="department" className="form-label fw-bold">Department <span className="text-danger">*</span></label>
                <select
                  className={`form-select ${errors.department ? 'is-invalid' : ''}`}
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <div className="invalid-feedback">{errors.department}</div>}
              </div>
            </div>

            {/* Assigned Faculty (Multi-select) */}
            <div className="mb-4">
              <label htmlFor="assigned_faculty" className="form-label fw-bold">Assigned Faculty (Optional)</label>
              <select
                multiple
                className="form-select"
                id="assigned_faculty"
                name="assigned_faculty"
                value={formData.assigned_faculty}
                onChange={handleChange}
                size="4"
              >
                {facultyList.map((faculty) => (
                  <option key={faculty._id} value={faculty._id}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              <div className="form-text">Hold down the Ctrl (Windows) or Command (Mac) button to select multiple options.</div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : 'Submit Event'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
