import React from 'react';
import { Users, Plus } from 'lucide-react';

const FacultyManagement = () => {
 return (
 <div className="space-y-6">
 {/* Section header */}
 <div>
 <h2 className="text-lg font-semibold text-gray-900 ">Faculty Management</h2>
 <p className="mt-1 text-sm text-gray-500 ">
 Add, edit, or remove faculty members and manage their roles.
 </p>
 </div>

 {/* Empty-state card */}
 <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 mb-4">
 <Users className="w-7 h-7 text-blue-600" />
 </div>
 <h3 className="text-base font-semibold text-gray-900 ">No faculty members yet</h3>
 <p className="mt-1 text-sm text-gray-500 max-w-sm">
 Faculty members will appear here once they are added to the system.
 </p>
 <button
 disabled
 className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
 >
 <Plus className="w-4 h-4" />
 Add Faculty
 </button>
 </div>
 </div>
 );
};

export default FacultyManagement;
