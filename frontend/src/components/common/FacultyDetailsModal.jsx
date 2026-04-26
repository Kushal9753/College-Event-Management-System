import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const FacultyDetailsModal = ({ facultyId, onClose }) => {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/faculty/${facultyId}`);
        setFaculty(res.data.data);
      } catch (err) {
        console.error('Failed to fetch faculty details', err);
        setError('Could not load faculty details.');
      } finally {
        setLoading(false);
      }
    };

    if (facultyId) fetchFaculty();
  }, [facultyId]);

  if (!facultyId) return null;

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
        
        {/* Top Header Section */}
        <div className="relative h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          
          {/* Profile Image / Initials Placeholder */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-20 h-20 rounded-full bg-white p-1 shadow-xl">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-50 to-purple-50 flex items-center justify-center border-2 border-indigo-100">
                {loading ? (
                  <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                  <span className="text-3xl font-black text-indigo-600">{getInitials(faculty?.name)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-12 pb-6 px-6 text-center">
          {loading ? (
            <div className="space-y-4 py-8">
              <div className="h-6 w-48 bg-gray-100 rounded-full mx-auto animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-50 rounded-full mx-auto animate-pulse"></div>
            </div>
          ) : error ? (
            <div className="py-12">
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold">Close</button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{faculty.name}</h2>
              <p className="text-indigo-600 font-bold text-xs tracking-wide uppercase mb-5">
                {faculty.designation || 'Faculty Member'}
              </p>

              <div className="grid grid-cols-1 gap-3 text-left">
                <InfoCard label="Email Address" value={faculty.email} icon="mail" />
                <InfoCard label="Contact Number" value={faculty.phone || 'N/A'} icon="phone" />
                <InfoCard label="Department" value={faculty.department} icon="building" />
                <InfoCard label="Institution" value={faculty.collegeName || 'CDGI'} icon="school" />
                
                {faculty.expertise?.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                      Areas of Expertise
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {faculty.expertise.map((exp, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white border border-indigo-100 text-indigo-700 text-xs font-bold rounded-lg shadow-sm">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={onClose}
                className="w-full mt-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98]"
              >
                Dismiss Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, icon }) => {
  const icons = {
    mail: <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
    phone: <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>,
    building: <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>,
    school: <path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all group">
      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 truncate">{label}</p>
        <p className="text-xs font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
};

export default FacultyDetailsModal;
