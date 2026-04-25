import React from 'react';

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
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-300 ">
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
 </svg>
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
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
 </svg>
 </button>
 {/* Delete */}
 <button
 onClick={() => onDelete(f._id)}
 className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
 title="Delete"
 >
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
 </svg>
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
