import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
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
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const STEPS = [
  { title: 'Academic Details', subtitle: 'Tell us about your college & course' },
  { title: 'Your Subjects', subtitle: 'Pick subjects you are studying' },
  { title: 'Interests & Goals', subtitle: 'Help us match your ambitions' },
  { title: 'Study Availability', subtitle: 'When do you prefer to study?' },
];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    college: user?.college || '',
    course: user?.course || COURSES[0],
    academic_year: user?.academic_year || 1,
    bio: user?.bio || '',
    subjects: parseJsonArray(user?.subjects),
    interests: parseJsonArray(user?.interests),
    goals: parseJsonArray(user?.goals),
    availability: parseJsonArray(user?.availability),
  });

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

  const handleNext = () => {
    if (step === 0 && !form.college.trim()) {
      toast.error('Please enter your college or university name');
      return;
    }
    if (step === 1 && form.subjects.length === 0) {
      toast.error('Select at least one subject');
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleFinish = async () => {
    if (form.availability.length === 0) {
      toast.error('Select at least one availability slot');
      return;
    }
    setSaving(true);
    try {
      await updateUser({
        ...form,
        academic_year: Number(form.academic_year),
        profile_completed: 1,
      });
      toast.success('Profile setup complete! Welcome to StudySync.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Failed to save profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {Math.round(progress)}% complete
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card hover={false} padding="p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {STEPS[step].title}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{STEPS[step].subtitle}</p>
        </div>

        {/* Step 1: College / Course / Year */}
        {step === 0 && (
          <div className="space-y-5">
            <Input
              label="College / University"
              placeholder="e.g. IIT Delhi, NIT Trichy, VIT Vellore"
              value={form.college}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, college: e.target.value }))
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Course / Degree
                </label>
                <select
                  value={form.course}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, course: e.target.value }))
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
                    setForm((prev) => ({
                      ...prev,
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Short Bio (optional)
              </label>
              <textarea
                rows={3}
                placeholder="Tell peers what you're working on or looking to learn..."
                value={form.bio}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Subjects */}
        {step === 1 && (
          <div className="flex flex-wrap gap-2.5">
            {SUBJECTS.map((subj) => {
              const selected = form.subjects.includes(subj);
              return (
                <button
                  key={subj}
                  type="button"
                  onClick={() => toggleItem('subjects', subj)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {subj}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Interests & Goals */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Areas of Interest
              </h3>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((item) => {
                  const selected = form.interests.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem('interests', item)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                        selected
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-violet-400'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Study Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((item) => {
                  const selected = form.goals.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleItem('goals', item)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Availability */}
        {step === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVAILABILITY.map((slot) => {
              const selected = form.availability.includes(slot);
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleItem('availability', slot)}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    selected
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span>{slot}</span>
                  {selected && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} loading={saving}>
              <Sparkles className="w-4 h-4" />
              Complete Setup
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
