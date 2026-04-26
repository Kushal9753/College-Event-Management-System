import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getUserData, setUserData } from '../../utils/tokenHandler';
import { 
  User, Mail, Phone, Building, Shield, Lock,
  Save, X, Edit3, Award, Users
} from 'lucide-react';

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

  const [stats, setStats] = useState({ activeEventsCount: 0, totalParticipants: 0 });

  useEffect(() => {
    // Initial load from local storage
    const data = getUserData();
    if (data) {
      setUser(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        collegeName: data.collegeName || data.department || '',
        password: ''
      });
    }

    const fetchProfileData = async () => {
      try {
        // Fetch fresh profile
        const profileRes = await api.get('/auth/profile');
        const freshUser = profileRes.data;
        setUser(freshUser);
        setUserData(freshUser); // update local storage
        setFormData({
          name: freshUser.name || '',
          phone: freshUser.phone || '',
          collegeName: freshUser.collegeName || freshUser.department || '',
          password: ''
        });

        if (freshUser.role === 'faculty') {
          // Fetch events to calculate stats
          const { default: EventService } = await import('../../services/eventService');
          const [createdRes, assignedRes] = await Promise.all([
            EventService.getMyEvents(),
            api.get('/events/assigned'),
          ]);
          
          const created = createdRes?.data || [];
          const assigned = assignedRes?.data?.data || [];
          
          const uniqueEvents = Array.from(new Map([...created, ...assigned].map(e => [e._id, e])).values());
          
          const activeEvents = uniqueEvents.length;
          const participants = uniqueEvents.reduce((sum, ev) => sum + (ev.registrations?.length || 0), 0);
          
          setStats({ activeEventsCount: activeEvents, totalParticipants: participants });
        }
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      }
    };

    fetchProfileData();
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
        <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        Loading faculty details...
      </div>
    </div>
  );

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-8 animate-fade-in font-sans">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Faculty Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your academic profile and department credentials.</p>
        </div>
      </div>

      {message.text && (
        <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          {message.type === 'error' ? <Shield className="w-5 h-5 flex-shrink-0" /> : <Save className="w-5 h-5 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Profile & Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="w-32 h-32 text-indigo-600" />
            </div>
            
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-600 flex items-center justify-center text-5xl font-bold mb-5 shadow-inner border-4 border-white ring-1 ring-gray-100">
              {getInitials(user.name)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{user.name}</h2>
            <div className="inline-flex items-center px-3 py-1 mt-2.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest border border-indigo-100">
              {user.role || 'Faculty'}
            </div>
            
            <div className="mt-8 w-full text-left space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                <Building className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Department</p>
                  <p className="text-sm font-medium text-gray-900">{user.department || user.collegeName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 shadow-lg shadow-indigo-600/20 text-white relative overflow-hidden text-center">
              <Award className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-10" />
              <p className="text-indigo-100 text-sm font-medium mb-1">Organized<br/>Events</p>
              <p className="text-4xl font-extrabold">{stats.activeEventsCount}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 shadow-lg shadow-blue-600/20 text-white relative overflow-hidden text-center">
              <Users className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white opacity-10" />
              <p className="text-blue-100 text-sm font-medium mb-1">Total<br/>Participants</p>
              <p className="text-4xl font-extrabold">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Professional Details</h3>
              <button 
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setMessage({text:'', type:''});
                }}
                className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                  isEditing 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {isEditing ? <><X className="w-4 h-4" /> Cancel Edit</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
              </button>
            </div>

            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-transparent transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      Contact Number
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-transparent transition-all outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      Institution / Department
                    </label>
                    <input 
                      type="text" 
                      name="collegeName"
                      value={formData.collegeName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-transparent transition-all outline-none"
                    />
                  </div>

                  {isEditing && (
                    <div className="space-y-2 md:col-span-2 pt-6 mt-2 border-t border-gray-100">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        Change Password (Optional)
                      </label>
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      />
                      <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        If you enter a password here, it will override your existing credential.
                      </p>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="pt-6 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving Changes...</>
                      ) : (
                        <><Save className="w-4 h-4" /> Save Profile Changes</>
                      )}
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
