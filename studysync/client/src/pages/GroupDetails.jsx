import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Check,
  X,
  Trash2,
  UserMinus,
  BookOpen,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import ResourceCard from '../components/shared/ResourceCard';
import SessionCard from '../components/shared/SessionCard';

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [resources, setResources] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [groupRes, resRes, sessRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get('/resources', { params: { group_id: id } }),
        api.get('/sessions', { params: { group_id: id } }),
      ]);

      const groupData = groupRes.data?.group || groupRes.data;
      setGroup(groupData);
      setMembers(groupData?.members || groupRes.data?.members || []);
      setResources(resRes.data?.resources || resRes.data || []);
      setSessions(sessRes.data?.sessions || sessRes.data || []);
    } catch {
      toast.error('Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const currentMember = members.find((m) => m.user_id === user?.id || m.id === user?.id);
  const isAdmin =
    group?.created_by === user?.id || currentMember?.role === 'admin';
  const isApprovedMember = currentMember?.status === 'approved';
  const isPending = currentMember?.status === 'pending';

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      const res = await api.post(`/groups/${id}/join`);
      toast.success(res.data?.message || 'Joined group');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not join group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await api.post(`/groups/${id}/leave`);
      toast.success('Left group');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not leave group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await api.delete(`/groups/${id}`);
      toast.success('Group deleted');
      navigate('/groups');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete group');
    }
  };

  const handleMemberStatus = async (memberUserId, status) => {
    try {
      await api.put(`/groups/${id}/members/${memberUserId}`, { status });
      toast.success(
        status === 'approved' ? 'Member approved' : 'Request rejected'
      );
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update member');
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    try {
      await api.delete(`/groups/${id}/members/${memberUserId}`);
      toast.success('Member removed');
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleDownloadResource = async (resource) => {
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
    } catch {
      toast.error('Failed to download resource');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading group..." className="py-20" />;
  }

  if (!group) {
    return (
      <EmptyState
        icon={Users}
        title="Group not found"
        description="This study group may have been deleted."
        actionLabel="Back to Groups"
        onAction={() => navigate('/groups')}
      />
    );
  }

  const approvedMembers = members.filter((m) => m.status === 'approved' || !m.status);
  const pendingMembers = members.filter((m) => m.status === 'pending');

  return (
    <div className="space-y-6">
      <Link
        to="/groups"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Study Groups
      </Link>

      {/* Group Header */}
      <Card hover={false} padding="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {group.subject && <Badge variant="indigo">{group.subject}</Badge>}
              {group.category && <Badge variant="purple">{group.category}</Badge>}
              <Badge variant={group.is_private ? 'yellow' : 'green'}>
                {group.is_private ? (
                  <>
                    <Lock className="w-3 h-3" /> Private
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" /> Public
                  </>
                )}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              {group.description || 'No description provided.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                {approvedMembers.length} / {group.max_members || 20} members
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isApprovedMember ? (
              group.created_by !== user?.id && (
                <Button
                  variant="outline"
                  onClick={handleLeave}
                  loading={actionLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Leave Group
                </Button>
              )
            ) : isPending ? (
              <Badge variant="yellow" size="md">
                Join Request Pending
              </Badge>
            ) : (
              <Button onClick={handleJoin} loading={actionLoading}>
                {group.is_private ? 'Request to Join' : 'Join Group'}
              </Button>
            )}

            {group.created_by === user?.id && (
              <Button variant="danger" size="sm" onClick={handleDeleteGroup}>
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Pending Requests (Admin Only) */}
      {isAdmin && pendingMembers.length > 0 && (
        <Card hover={false}>
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Pending Join Requests ({pendingMembers.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {pendingMembers.map((m) => {
              const memberId = m.user_id || m.id;
              return (
                <div
                  key={memberId}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={m.avatar_url} name={m.full_name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {m.full_name}
                      </p>
                      <p className="text-xs text-slate-500">{m.course || 'Student'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleMemberStatus(memberId, 'approved')}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleMemberStatus(memberId, 'rejected')}
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Members List */}
      <Card hover={false}>
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Members ({approvedMembers.length})
        </h2>
        {approvedMembers.length === 0 ? (
          <p className="text-sm text-slate-500">No members yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {approvedMembers.map((m) => {
              const memberId = m.user_id || m.id;
              return (
                <div
                  key={memberId}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                >
                  <Link
                    to={`/users/${memberId}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <Avatar src={m.avatar_url} name={m.full_name} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {m.full_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {m.role === 'admin' ? 'Admin' : m.course || 'Member'}
                      </p>
                    </div>
                  </Link>
                  {isAdmin && memberId !== user?.id && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(memberId)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Group Resources & Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Group Resources
          </h2>
          {resources.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No group resources"
              description="Resources shared with this group will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  currentUserId={user?.id}
                  onDownload={handleDownloadResource}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            Group Sessions
          </h2>
          {sessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No group sessions"
              description="Study sessions linked to this group will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  session={s}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
