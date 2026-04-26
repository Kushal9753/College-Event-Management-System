import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';

const TaskManagement = () => {
 return (
 <div className="space-y-6">
 {/* Section header */}
 <div>
 <h2 className="text-lg font-semibold text-gray-900 ">Task Management</h2>
 <p className="mt-1 text-sm text-gray-500 ">
 Assign, track, and manage tasks for faculty members.
 </p>
 </div>

 {/* Empty-state card */}
 <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
 <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 mb-4">
 <ClipboardList className="w-7 h-7 text-amber-600" />
 </div>
 <h3 className="text-base font-semibold text-gray-900 ">No tasks assigned</h3>
 <p className="mt-1 text-sm text-gray-500 max-w-sm">
 Create and assign tasks to faculty. Track progress and deadlines here.
 </p>
 <button
 disabled
 className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white opacity-50 cursor-not-allowed"
 >
 <Plus className="w-4 h-4" />
 Create Task
 </button>
 </div>
 </div>
 );
};

export default TaskManagement;
