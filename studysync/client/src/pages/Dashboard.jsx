import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UsersRound,
  Calendar,
  BookOpen,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import PartnerCard from '../components/shared/PartnerCard';
import GroupCard from '../components/shared/GroupCard';
import SessionCard from '../components/shared/SessionCard';
import ResourceCard from '../components/shared/ResourceCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [resources, setResources] = useState([]);
  const [actionId, setActionId] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [usersRes, groupsRes, sessionsRes, resourcesRes] =
        await Promise.all([
          api.get('/users'),
          api.get('/groups', { params: { my: true } }),
          api.get('/sessions', { params: { upcoming: true } }),
          api.get('/resources'),
        ]);

      const usersList = usersRes.data?.users || usersRes.data || [];
      const sortedPartners = [...usersList].sort(
        (a, b) =>
          (b.compatibility ?? b.compatibility_score ?? 0) -
          (a.compatibility ?? a.compatibility_score ?? 0)
      );

      setPartners(sortedPartners);
      setMyGroups(groupsRes.data?.groups || groupsRes.data || []);
      setSessions(sessionsRes.data?.sessions || sessionsRes.data || []);
      setResources(resourcesRes.data?.resources || resourcesRes.data || []);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleJoinSession = async (id) => {
    setActionId(id);
    try {
      await api.post(`/sessions/${id}/join`);
      toast.success('Joined study session');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not join session');
    } finally {
      setActionId(null);
    }
  };

  const handleLeaveSession = async (id) => {
    setActionId(id);
    try {
      await api.post(`/sessions/${id}/leave`);
      toast.success('Left study session');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not leave session');
    } finally {
      setActionId(null);
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
      toast.success('Download started');
    } catch {
      toast.error('Failed to download resource');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading your dashboard..." className="py-20" />;
  }

  const stats = [
    {
      label: 'Potential Partners',
      value: partners.length,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      to: '/partners',
    },
    {
      label: 'My Study Groups',
      value: myGroups.length,
      icon: UsersRound,
      color: 'bg-violet-50 text-violet-600',
      to: '/groups',
    },
    {
      label: 'Upcoming Sessions',
      value: sessions.length,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
      to: '/sessions',
    },
    {
      label: 'Shared Resources',
      value: resources.length,
      icon: BookOpen,
      color: 'bg-emerald-50 text-emerald-600',
      to: '/resources',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-indigo-100 text-sm font-medium flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Welcome back
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Hello, {user?.full_name || 'Student'}!
            </h1>
            <p className="text-indigo-100 text-sm mt-1">
              Ready to connect with study partners and hit your goals today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/partners">
              <Button className="bg-white text-indigo-700 hover:bg-indigo-50 from-white to-white">
                Find Partners
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Incomplete profile prompt */}
      {user && !user.profile_completed && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Complete your academic profile
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Add your subjects, interests, and availability to unlock accurate partner matching.
              </p>
            </div>
          </div>
          <Link to="/onboarding">
            <Button size="sm" variant="primary">
              Complete Setup
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to}>
            <Card className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 truncate">{label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recommended Partners */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recommended Study Partners
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by subject, interest, and schedule compatibility
            </p>
          </div>
          <Link
            to="/partners"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {partners.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No partners found yet"
            description="Update your profile subjects and availability to get matched with students."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {partners.slice(0, 4).map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </section>

      {/* My Groups & Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Groups */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">My Study Groups</h2>
            <Link
              to="/groups"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Browse groups
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {myGroups.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="You haven't joined any groups"
              description="Explore public study groups or start your own."
              actionLabel="Explore Groups"
              onAction={() => (window.location.href = '/groups')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myGroups.slice(0, 4).map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Sessions */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Upcoming Sessions
            </h2>
            <Link
              to="/sessions"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All sessions
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {sessions.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming sessions"
              description="Schedule a study session to collaborate with peers."
              actionLabel="View Sessions"
              onAction={() => (window.location.href = '/sessions')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sessions.slice(0, 4).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={user?.id}
                  onJoin={handleJoinSession}
                  onLeave={handleLeaveSession}
                  actionLoading={actionId === session.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent Resources */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Resources</h2>
          <Link
            to="/resources"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Resource library
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {resources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No resources shared yet"
            description="Upload notes, PDFs, or guides to help your fellow students."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resources.slice(0, 4).map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                currentUserId={user?.id}
                onDownload={handleDownloadResource}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
