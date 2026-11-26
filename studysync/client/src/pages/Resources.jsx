import React, { useState, useEffect, useCallback } from 'react';
import { Search, Upload, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ResourceCard from '../components/shared/ResourceCard';

const FILE_TYPES = ['pdf', 'doc', 'ppt', 'image', 'other'];

export default function Resources() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    type: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    subject: SUBJECTS[0],
    file: null,
  });

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.subject) params.subject = filters.subject;
      if (filters.type) params.type = filters.type;

      const res = await api.get('/resources', { params });
      setResources(res.data?.resources || res.data || []);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchResources]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title.trim());
    formData.append('description', uploadForm.description.trim());
    formData.append('subject', uploadForm.subject);
    formData.append('file', uploadForm.file);

    setUploading(true);
    try {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resource uploaded!');
      setIsModalOpen(false);
      setUploadForm({
        title: '',
        description: '',
        subject: SUBJECTS[0],
        file: null,
      });
      fetchResources();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (resource) => {
    try {
      const res = await api.get(`/resources/${resource.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.file_name || resource.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
      fetchResources();
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Resource deleted');
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete resource');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Resource Library
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Share and download lecture notes, slides, and study guides
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Upload className="w-4 h-4" />
          Upload Resource
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          icon={Search}
          placeholder="Search resources..."
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
        />

        <select
          value={filters.subject}
          onChange={(e) =>
            setFilters((p) => ({ ...p, subject: e.target.value }))
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) =>
            setFilters((p) => ({ ...p, type: e.target.value }))
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="">All File Types</option>
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading resources..." className="py-16" />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resources found"
          description="Be the first to share study notes or adjust your filters."
          actionLabel="Upload Resource"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              currentUserId={user?.id}
              onDownload={handleDownload}
              onDelete={handleDelete}
              deleting={deletingId === resource.id}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Study Resource"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Dynamic Programming Cheat Sheet"
            value={uploadForm.title}
            onChange={(e) =>
              setUploadForm((p) => ({ ...p, title: e.target.value }))
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject
            </label>
            <select
              value={uploadForm.subject}
              onChange={(e) =>
                setUploadForm((p) => ({ ...p, subject: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of the file..."
              value={uploadForm.description}
              onChange={(e) =>
                setUploadForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              File
            </label>
            <input
              type="file"
              onChange={(e) =>
                setUploadForm((p) => ({
                  ...p,
                  file: e.target.files?.[0] || null,
                }))
              }
              className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Upload File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
