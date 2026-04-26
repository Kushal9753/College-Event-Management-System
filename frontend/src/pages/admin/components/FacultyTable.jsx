import React from 'react';
import { Users, Edit3, Trash2 } from 'lucide-react';

const FacultyTable = ({
 faculty,
 selectedIds,
 onToggleSelect,
 onToggleSelectAll,
 onEdit,
 onDelete,
 onToggleStatus,
 isLoading,
}) => {
 const allSelected = faculty.length > 0 && selectedIds.length === faculty.length;

 if (isLoading) {
 return (
 <div className="flex justify-center items-center py-20">
 <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
 </div>
 );
 }

 if (faculty.length === 0) {
 return (
 <div className="text-center py-16 text-gray-500 ">
 <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" strokeWidth={1} />
 <p className="text-lg font-medium">No faculty found</p>
 <p className="text-sm mt-1">Try adjusting your search or filters.</p>
 </div>
 );
 }

 return (
 <div className="overflow-x-auto rounded-xl border border-gray-200 ">
 <table className="w-full text-sm text-left">
 <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
 <tr>
 <th className="px-4 py-3 w-10">
 <input
 type="checkbox"
 checked={allSelected}
 onChange={onToggleSelectAll}
 className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
 />
 </th>
 <th className="px-4 py-3">Name</th>
 <th className="px-4 py-3 hidden md:table-cell">Email</th>
 <th className="px-4 py-3 md:table-cell">Phone</th>
 <th className="px-4 py-3">Department</th>
 <th className="px-4 py-3 hidden md:table-cell">College</th>
 <th className="px-4 py-3 hidden md:table-cell">Expertise</th>
 <th className="px-4 py-3">Status</th>
 <th className="px-4 py-3 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-100 ">
 {faculty.map((f) => {
 const isSelected = selectedIds.includes(f._id);
 return (
 <tr
 key={f._id}
 className={`transition-colors ${
 isSelected
 ? 'bg-blue-50 '
 : 'bg-white hover:bg-gray-50 '
 }`}
 >
 <td className="px-4 py-3">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={() => onToggleSelect(f._id)}
 className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
 />
 </td>
 <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
 {f.name}
 </td>
 <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
 {f.email}
 </td>
 <td className="px-4 py-3 text-gray-600 md:table-cell">
 {f.phone}
 </td>
 <td className="px-4 py-3 text-gray-600 ">
 {f.department}
 </td>
 <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
 {f.collegeName}
 </td>
 <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
 <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 ">
 {f.expertise}
 </span>
 </td>
 <td className="px-4 py-3">
 <button
 onClick={() => onToggleStatus(f._id)}
 className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
 f.status === 'active'
 ? 'bg-green-100 text-green-700 hover:bg-green-200 '
 : 'bg-red-100 text-red-700 hover:bg-red-200 '
 }`}
 >
 <span className={`w-1.5 h-1.5 rounded-full ${f.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
 {f.status === 'active' ? 'Active' : 'Inactive'}
 </button>
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center justify-end gap-2">
 {/* Edit */}
 <button
 onClick={() => onEdit(f)}
 className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
 title="Edit"
 >
 <Edit3 className="w-4 h-4" />
 </button>
 {/* Delete */}
 <button
 onClick={() => onDelete(f._id)}
 className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
 title="Delete"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 );
};

export default FacultyTable;
