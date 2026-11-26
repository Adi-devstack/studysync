import React, { useState, useEffect } from 'react';
import { Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  SUBJECTS,
  COURSES,
  INTERESTS,
  GOALS,
  AVAILABILITY,
  ACADEMIC_YEARS,
  parseJsonArray,
} from '../constants';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    college: '',
    course: COURSES[0],
    academic_year: 1,
    bio: '',
    avatar_url: '',
    subjects: [],
    interests: [],
    goals: [],
    availability: [],
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        college: user.college || '',
        course: user.course || COURSES[0],
        academic_year: user.academic_year || 1,
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        subjects: parseJsonArray(user.subjects),
        interests: parseJsonArray(user.interests),
        goals: parseJsonArray(user.goals),
        availability: parseJsonArray(user.availability),
      });
    }
  }, [user]);

  const toggleItem = (field, item) => {
    setForm((prev) => {
      const exists = prev[field].includes(item);
      return {
        ...prev,
        [field]: exists
          ? prev[field].filter((x) => x !== item)
          : [...prev[field], item],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        ...form,
        academic_year: Number(form.academic_year),
        profile_completed: 1,
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-600 mt-1">
          Keep your academic details up to date for better study partner matches
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card hover={false}>
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-200">
            <Avatar
              src={form.avatar_url}
              name={form.full_name}
              size="xl"
            />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {form.full_name || 'Student'}
              </h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={(e) =>
                setForm((p) => ({ ...p, full_name: e.target.value }))
              }
              required
            />
            <Input
              label="College / University"
              value={form.college}
              onChange={(e) =>
                setForm((p) => ({ ...p, college: e.target.value }))
              }
              placeholder="e.g. IIT Bombay"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course
              </label>
              <select
                value={form.course}
                onChange={(e) =>
                  setForm((p) => ({ ...p, course: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Academic Year
              </label>
              <select
                value={form.academic_year}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    academic_year: Number(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Bio
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) =>
                setForm((p) => ({ ...p, bio: e.target.value }))
              }
              placeholder="Tell others about your study style and goals..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="text-base font-semibold text-slate-900 mb-3">
            Subjects
          </h3>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((item) => {
              const selected = form.subjects.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleItem('subjects', item)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {selected && <Check className="w-3 h-3" />}
                  {item}
                </button>
              );
            })}
          </div>
        </Card>

        <Card hover={false} className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((item) => {
                const selected = form.interests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem('interests', item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              Goals
            </h3>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((item) => {
                const selected = form.goals.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem('goals', item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selected
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="text-base font-semibold text-slate-900 mb-3">
            Availability
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {AVAILABILITY.map((slot) => {
              const selected = form.availability.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleItem('availability', slot)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    selected
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span>{slot}</span>
                  {selected && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" loading={saving}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
