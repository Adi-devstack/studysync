import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { SUBJECTS } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import SessionCard from '../components/shared/SessionCard';

export default function Sessions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    date: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    subject: SUBJECTS[0],
    session_date: '',
    start_time: '18:00',
    end_time: '19:30',
    location: 'Online',
    max_participants: 10,
  });

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab === 'upcoming') params.upcoming = true;
      if (activeTab === 'my') params.my = true;
      if (filters.subject) params.subject = filters.subject;
      if (filters.date) params.date = filters.date;

      const res = await api.get('/sessions', { params });
      let list = res.data?.sessions || res.data || [];
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        list = list.filter(
          (s) =>
            s.title?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q) ||
            s.location?.toLowerCase().includes(q)
        );
      }
      setSessions(list);
    } catch {
      toast.error('Failed to load study sessions');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSessions();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchSessions]);

  const handleJoin = async (id) => {
    setActionId(id);
    try {
      await api.post(`/sessions/${id}/join`);
      toast.success('Joined study session');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not join session');
    } finally {
      setActionId(null);
    }
  };

  const handleLeave = async (id) => {
    setActionId(id);
    try {
      await api.post(`/sessions/${id}/leave`);
      toast.success('Left study session');
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not leave session');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study session?')) return;
    setActionId(id);
    try {
      await api.delete(`/sessions/${id}`);
      toast.success('Session deleted');
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete session');
    } finally {
      setActionId(null);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSession.title.trim() || !newSession.session_date) {
      toast.error('Title and date are required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/sessions', {
        ...newSession,
        max_participants: Number(newSession.max_participants) || 10,
      });
      toast.success('Study session scheduled!');
      setIsModalOpen(false);
      setNewSession({
        title: '',
        description: '',
        subject: SUBJECTS[0],
        session_date: '',
        start_time: '18:00',
        end_time: '19:30',
        location: 'Online',
        max_participants: 10,
      });
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Study Sessions</h1>
          <p className="text-sm text-slate-600 mt-1">
            Schedule and join live study sessions with your peers
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Schedule Session
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { key: 'upcoming', label: 'Upcoming Sessions' },
          { key: 'my', label: 'My Sessions' },
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
          placeholder="Search sessions..."
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

        <Input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters((p) => ({ ...p, date: e.target.value }))}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading sessions..." className="py-16" />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            activeTab === 'my'
              ? 'No joined sessions yet'
              : 'No upcoming sessions found'
          }
          description="Schedule a new study session or adjust your filters."
          actionLabel="Schedule Session"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              currentUserId={user?.id}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onDelete={handleDelete}
              actionLoading={actionId === session.id}
            />
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Study Session"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <Input
            label="Session Title"
            placeholder="e.g. Graph Algorithms Practice"
            value={newSession.title}
            onChange={(e) =>
              setNewSession((p) => ({ ...p, title: e.target.value }))
            }
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Subject
            </label>
            <select
              value={newSession.subject}
              onChange={(e) =>
                setNewSession((p) => ({ ...p, subject: e.target.value }))
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
              placeholder="Topics to cover, prerequisites, or meeting link..."
              value={newSession.description}
              onChange={(e) =>
                setNewSession((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Date"
              type="date"
              value={newSession.session_date}
              onChange={(e) =>
                setNewSession((p) => ({ ...p, session_date: e.target.value }))
              }
              required
            />
            <Input
              label="Start Time"
              type="time"
              value={newSession.start_time}
              onChange={(e) =>
                setNewSession((p) => ({ ...p, start_time: e.target.value }))
              }
              required
            />
            <Input
              label="End Time"
              type="time"
              value={newSession.end_time}
              onChange={(e) =>
                setNewSession((p) => ({ ...p, end_time: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="Online or Room 302"
              value={newSession.location}
              onChange={(e) =>
                setNewSession((p) => ({ ...p, location: e.target.value }))
              }
            />
            <Input
              label="Max Participants"
              type="number"
              min={2}
              max={100}
              value={newSession.max_participants}
              onChange={(e) =>
                setNewSession((p) => ({
                  ...p,
                  max_participants: e.target.value,
                }))
              }
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Schedule Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
