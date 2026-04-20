import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getUserData, setUserData } from '../../utils/tokenHandler';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    collegeName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Optional: Placeholders for Faculty stats (since they aren't wired up to a faculty-specific events context yet)
  const activeEventsCount = 0;
  const totalParticipants = 0;

  useEffect(() => {
    const data = getUserData();
    if (data) {
      setUser(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        collegeName: data.collegeName || '',
        password: ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.put('/auth/profile', formData);
      const updatedUser = { ...user, ...res.data };
      setUserData(updatedUser);
      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ text: 'Faculty profile updated successfully!', type: 'success' });
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="flex justify-center items-center h-64 text-gray-500 font-medium">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
        Loading faculty details...
      </div>
    </div>
  );

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Profile</h1>
        <p className="text-gray-500 font-medium">Manage your academic profile and department details.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl shadow-sm text-sm font-semibold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Profile & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-4xl font-bold mb-4 shadow-inner">
              {getInitials(user.name)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <div className="inline-flex items-center px-3 py-1 mt-2 rounded-full bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-widest border border-amber-100">
              {user.role || 'Faculty'}
            </div>
            
            <div className="mt-6 w-full pt-6 border-t border-gray-100 text-left space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-gray-800 break-all">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Employee ID / Enrollment</p>
                <p className="text-sm font-medium text-gray-800">{user.enrollmentNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-semibold text-gray-500 mb-1 leading-tight">Organized<br/>Events</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{activeEventsCount}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between">
              <p className="text-sm font-semibold text-gray-500 mb-1 leading-tight">Total<br/>Participants</p>
              <p className="text-3xl font-bold text-amber-500 mt-2">{totalParticipants}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Professional Details</h3>
              <button 
                onClick={() => {
                  setIsEditing(!isEditing);
                  setMessage({text:'', type:''});
                }}
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                  isEditing 
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                }`}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-1.5 md:col-span-2 flex flex-col">
                    <label className="text-sm font-semibold text-gray-700">Institution / Department</label>
                    <input 
                      type="text" 
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                    />
                  </div>

                  {isEditing && (
                    <div className="space-y-1.5 md:col-span-2 pt-4 border-t border-gray-100 mt-2">
                      <label className="text-sm font-semibold text-gray-700">Change Password (Optional)</label>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">If you enter a password here, it will override your existing credential.</p>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-sm disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
