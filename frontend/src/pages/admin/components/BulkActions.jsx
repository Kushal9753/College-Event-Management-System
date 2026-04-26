import React, { useRef } from 'react';
import { Upload, Trash2 } from 'lucide-react';

const BulkActions = ({ selectedCount, onBulkDelete, onCsvUpload }) => {
 const fileInputRef = useRef(null);

 if (selectedCount === 0) return null;

 return (
 <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl animate-in">
 <span className="text-sm font-medium text-blue-700 ">
 {selectedCount} selected
 </span>

 <div className="flex items-center gap-2 ml-auto">
 {/* CSV Upload */}
 <input
 ref={fileInputRef}
 type="file"
 accept=".csv"
 className="hidden"
 onChange={(e) => {
 if (e.target.files[0]) {
 onCsvUpload(e.target.files[0]);
 e.target.value = '';
 }
 }}
 />
 <button
 onClick={() => fileInputRef.current?.click()}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
 >
 <Upload className="w-4 h-4" />
 Upload CSV
 </button>

 {/* Bulk Delete */}
 <button
 onClick={onBulkDelete}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
 >
 <Trash2 className="w-4 h-4" />
 Delete ({selectedCount})
 </button>
 </div>
 </div>
 );
};

export default BulkActions;
