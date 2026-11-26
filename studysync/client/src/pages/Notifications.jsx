import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import NotificationItem from '../components/shared/NotificationItem';

export default function Notifications() {
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const refreshUnreadCount = outletCtx?.refreshUnreadCount;

  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { unread: true } : {};
      const res = await api.get('/notifications', { params });
      setNotifications(res.data?.notifications || res.data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put('/notifications/read-all');
      toast.success('All notifications marked as read');
      fetchNotifications();
      refreshUnreadCount?.();
    } catch {
      toast.error('Failed to mark notifications as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: 1 } : n))
        );
        refreshUnreadCount?.();
      } catch {
        // Ignore silent failure
      }
    }

    if (notif.reference_type === 'group' && notif.reference_id) {
      navigate(`/groups/${notif.reference_id}`);
    } else if (notif.reference_type === 'user' && notif.reference_id) {
      navigate(`/users/${notif.reference_id}`);
    } else if (notif.reference_type === 'session') {
      navigate('/sessions');
    } else if (notif.reference_type === 'resource') {
      navigate('/resources');
    }
  };

  const unreadExists = notifications.some((n) => !n.is_read);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-600 mt-1">
            Stay updated on group invites, sessions, and partner matches
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          loading={markingAll}
          disabled={!unreadExists}
          onClick={handleMarkAllRead}
        >
          <CheckCheck className="w-4 h-4" />
          Mark All Read
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: 'Unread' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" text="Loading notifications..." className="py-16" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            filter === 'unread'
              ? 'No unread notifications'
              : 'You are all caught up'
          }
          description="New activity from your study groups and sessions will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onClick={handleItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
