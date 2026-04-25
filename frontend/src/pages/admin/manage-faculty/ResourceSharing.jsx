import React, { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';
import { Upload, FileText, Link as LinkIcon, Trash2 } from 'lucide-react';

const ResourceSharing = () => {
  const backendOrigin =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL?.replace('/api', '') ||
    window.location.origin;

  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [sharedWith, setSharedWith] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/files');
      setResources(res.data.data);
    } catch (error) {
      showToast('Failed to load resources', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sharedWith', sharedWith);

    try {
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showToast('Resource uploaded successfully!');
      setIsModalOpen(false);
      setFile(null);
      setSharedWith('all');
      fetchResources();
    } catch (error) {
      showToast('Failed to upload resource', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/files/${id}`);
      showToast('Resource deleted');
      fetchResources();
    } catch (error) {
      showToast('Failed to delete resource', 'error');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 ">Resource Sharing</h2>
          <p className="mt-1 text-sm text-gray-500 ">
            Share documents, files, and resources with faculty members.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
        >
          <Upload className="w-5 h-5" />
          Upload Resource
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-4">
            <FileText className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 ">No resources shared</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            Upload and share documents, templates, and other resources with faculty.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-600 ">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 ">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Date Shared</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {resources.map((res) => (
                <tr key={res._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    <LinkIcon className="w-5 h-5 text-gray-400" />
                    <a
                      href={res.fileUrl?.startsWith('http') ? res.fileUrl : `${backendOrigin}${res.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-emerald-600 hover:underline"
                    >
                      {res.fileName}
                    </a>
                  </td>
                  <td className="px-6 py-4">{new Date(res.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 capitalize">{res.sharedWith}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(res._id)} className="text-red-600 hover:text-red-800 p-2">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Resource</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 "
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Share With</label>
                <select
                  value={sharedWith}
                  onChange={(e) => setSharedWith(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">Everyone</option>
                  <option value="faculty">Faculty Only</option>
                  <option value="department">Within Department</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isUploading || !file} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center">
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ResourceSharing;
