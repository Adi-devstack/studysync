import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, UsersRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { SUBJECTS, GROUP_CATEGORIES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import GroupCard from '../components/shared/GroupCard';

export default function Groups() {
  const [activeTab, setActiveTab] = useState('all');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    category: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: SUBJECTS[0],
    category: 'study',
    is_private: false,
    max_members: 20,
  });

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'my') params.my = true;
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.subject) params.subject = filters.subject;
      if (filters.category) params.category = filters.category;

      const res = await api.get('/groups', { params });
      setGroups(res.data?.groups || res.data || []);
    } catch {
      toast.error('Failed to load study groups');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchGroups]);

  const handleJoin = async (id) => {
    setActionId(id);
    try {
      const res = await api.post(`/groups/${id}/join`);
      toast.success(res.data?.message || 'Joined group successfully');
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not join group');
    } finally {
      setActionId(null);
    }
  };

  const handleLeave = async (id) => {
    setActionId(id);
    try {
      await api.post(`/groups/${id}/leave`);
      toast.success('Left group');
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not leave group');
    } finally {
      setActionId(null);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroup.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/groups', {
        ...newGroup,
        max_members: Number(newGroup.max_members) || 20,
      });
      toast.success('Study group created!');
      setIsModalOpen(false);
      setNewGroup({
        name: '',
        description: '',
        subject: SUBJECTS[0],
        category: 'study',
        is_private: false,
        max_members: 20,
      });
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Study Groups</h1>
          <p className="text-sm text-slate-600 mt-1">
            Collaborate in subject-focused groups and project teams
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { key: 'all', label: 'All Groups' },
          { key: 'my', label: 'My Groups' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          icon={Search}
          placeholder="Search groups..."
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
          value={filters.category}
          onChange={(e) =>
            setFilters((p) => ({ ...p, category: e.target.value }))
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <option value="">All Categories</option>
          {GROUP_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading groups..." className="py-16" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={
            activeTab === 'my'
              ? 'You are not in any groups yet'
              : 'No study groups found'
          }
          description="Create a new study group or adjust your search filters."
          actionLabel="Create Group"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={handleJoin}
              onLeave={handleLeave}
              actionLoading={actionId === group.id}
            />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Study Group"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="Group Name"
            placeholder="e.g. DSA Interview Prep Squad"
            value={newGroup.name}
            onChange={(e) =>
              setNewGroup((p) => ({ ...p, name: e.target.value }))
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What will this group focus on?"
              value={newGroup.description}
              onChange={(e) =>
                setNewGroup((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Subject
              </label>
              <select
                value={newGroup.subject}
                onChange={(e) =>
                  setNewGroup((p) => ({ ...p, subject: e.target.value }))
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
                Category
              </label>
              <select
                value={newGroup.category}
                onChange={(e) =>
                  setNewGroup((p) => ({ ...p, category: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {GROUP_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="Max Members"
              type="number"
              min={2}
              max={100}
              value={newGroup.max_members}
              onChange={(e) =>
                setNewGroup((p) => ({ ...p, max_members: e.target.value }))
              }
            />

            <label className="flex items-center gap-2.5 pt-5 cursor-pointer">
              <input
                type="checkbox"
                checked={newGroup.is_private}
                onChange={(e) =>
                  setNewGroup((p) => ({ ...p, is_private: e.target.checked }))
                }
                className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700 font-medium">
                Private Group (requires approval)
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
