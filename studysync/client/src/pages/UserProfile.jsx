import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  Sparkles,
  Clock,
  CheckCircle2,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { parseJsonArray } from '../constants';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

export default function UserProfile() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userRes, compatRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/compatibility`).catch(() => ({ data: null })),
        ]);

        setStudent(userRes.data?.user || userRes.data);
        setCompatibility(compatRes.data);
      } catch {
        toast.error('Failed to load student profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading profile..." className="py-20" />;
  }

  if (!student) {
    return (
      <EmptyState
        icon={User}
        title="Student not found"
        description="The requested profile could not be found."
      />
    );
  }

  const subjects = parseJsonArray(student.subjects);
  const interests = parseJsonArray(student.interests);
  const goals = parseJsonArray(student.goals);
  const availability = parseJsonArray(student.availability);

  const score =
    compatibility?.score ??
    compatibility?.compatibility ??
    student.compatibility ??
    0;
  const reasons = compatibility?.reasons || student.reasons || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        to="/partners"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Find Partners
      </Link>

      {/* Profile Header */}
      <Card hover={false} padding="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              src={student.avatar_url}
              name={student.full_name}
              size="2xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {student.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mt-1">
                {student.course && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-4 h-4 text-indigo-500" />
                    {student.course}
                    {student.academic_year ? ` • Year ${student.academic_year}` : ''}
                  </span>
                )}
                {student.college && (
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    {student.college}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white px-5 py-3.5 rounded-2xl text-center flex-shrink-0 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              Compatibility
            </div>
            <p className="text-3xl font-bold mt-0.5">{Math.round(score)}%</p>
          </div>
        </div>

        {student.bio && (
          <p className="mt-5 pt-5 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
            {student.bio}
          </p>
        )}
      </Card>

      {/* Compatibility Reasons */}
      {reasons.length > 0 && (
        <Card hover={false}>
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Why You Match
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {reasons.map((reason, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Academic Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hover={false}>
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Subjects
          </h2>
          {subjects.length === 0 ? (
            <p className="text-sm text-slate-400">No subjects listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <Badge key={s} variant="indigo" size="md">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Interests
          </h2>
          {interests.length === 0 ? (
            <p className="text-sm text-slate-400">No interests listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <Badge key={i} variant="purple" size="md">
                  {i}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Study Goals
          </h2>
          {goals.length === 0 ? (
            <p className="text-sm text-slate-400">No goals listed</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => (
                <Badge key={g} variant="blue" size="md">
                  {g}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        <Card hover={false}>
          <h2 className="text-base font-semibold text-slate-900 mb-3">
            Availability
          </h2>
          {availability.length === 0 ? (
            <p className="text-sm text-slate-400">No availability listed</p>
          ) : (
            <div className="space-y-2">
              {availability.map((slot) => (
                <div
                  key={slot}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>{slot}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
