import React, { useState, useEffect, useCallback, useMemo } from 'react';
import facultyService, { departments, expertiseAreas } from '../../services/facultyService';
import FacultyTable from './components/FacultyTable';
import FacultyForm from './components/FacultyForm';
import BulkActions from './components/BulkActions';

const ManageFaculty = () => {
  // --- State ---
  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'single'|'bulk', id?: string }
  const [toast, setToast] = useState(null);

  // --- Fetch faculty ---
  const fetchFaculty = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await facultyService.getAll();
      setFaculty(response.data);
    } catch {
      showToast('Failed to load faculty', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  // --- Debounced search ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- Filtered data ---
  const filteredFaculty = useMemo(() => {
    return faculty.filter(f => {
      const matchesSearch = !debouncedSearch ||
        f.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        f.email.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesDept = !departmentFilter || f.department === departmentFilter;
      const matchesExpertise = !expertiseFilter || f.expertise === expertiseFilter;
      return matchesSearch && matchesDept && matchesExpertise;
    });
  }, [faculty, debouncedSearch, departmentFilter, expertiseFilter]);

  // --- Toast ---
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Selection ---
  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const handleToggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.length === filteredFaculty.length ? [] : filteredFaculty.map(f => f._id)
    );
  };

  // --- CRUD ---
  const handleAdd = () => { setEditingFaculty(null); setIsFormOpen(true); };
  const handleEdit = (f) => { setEditingFaculty(f); setIsFormOpen(true); };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingFaculty) {
        await facultyService.update(editingFaculty._id, formData);
        showToast('Faculty updated successfully');
      } else {
        await facultyService.create(formData);
        showToast('Faculty added successfully');
      }
      setIsFormOpen(false);
      setEditingFaculty(null);
      await fetchFaculty();
    } catch {
      showToast('Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete ---
  const handleDeleteClick = (id) => setDeleteConfirm({ type: 'single', id });
  const handleBulkDeleteClick = () => setDeleteConfirm({ type: 'bulk' });

  const handleConfirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'single') {
        await facultyService.delete(deleteConfirm.id);
        showToast('Faculty deleted');
      } else {
        await facultyService.deleteMany(selectedIds);
        showToast(`${selectedIds.length} faculty deleted`);
        setSelectedIds([]);
      }
      setDeleteConfirm(null);
      await fetchFaculty();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  // --- Toggle status ---
  const handleToggleStatus = async (id) => {
    try {
      await facultyService.toggleStatus(id);
      await fetchFaculty();
    } catch {
      showToast('Status update failed', 'error');
    }
  };

  // --- CSV upload (UI only) ---
  const handleCsvUpload = (file) => {
    showToast(`CSV "${file.name}" received — backend processing not yet implemented`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Faculty</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {faculty.length} total &middot; {faculty.filter(f => f.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Faculty
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        {/* Department filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[160px]"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {/* Expertise filter */}
        <select
          value={expertiseFilter}
          onChange={(e) => setExpertiseFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-[160px]"
        >
          <option value="">All Expertise</option>
          {expertiseAreas.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedIds.length}
        onBulkDelete={handleBulkDeleteClick}
        onCsvUpload={handleCsvUpload}
      />

      {/* Table */}
      <FacultyTable
        faculty={filteredFaculty}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onToggleStatus={handleToggleStatus}
        isLoading={isLoading}
      />

      {/* Add/Edit Modal */}
      <FacultyForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingFaculty(null); }}
        onSubmit={handleFormSubmit}
        initialData={editingFaculty}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-600 dark:text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {deleteConfirm.type === 'single'
                    ? 'This faculty member will be permanently removed.'
                    : `${selectedIds.length} faculty members will be permanently removed.`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ManageFaculty;
