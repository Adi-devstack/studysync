import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  UsersRound,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Smart Partner Matching',
    description:
      'Compatibility scoring matches you with peers who share your subjects, goals, and study schedule.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: UsersRound,
    title: 'Focused Study Groups',
    description:
      'Join public or private groups for exam prep, coding projects, and subject-level discussions.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: BookOpen,
    title: 'Shared Resource Library',
    description:
      'Upload and download lecture notes, past papers, slide decks, and curated study guides.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Calendar,
    title: 'Collaborative Sessions',
    description:
      'Schedule online or in-person study sessions, track participants, and stay accountable.',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Build Your Academic Profile',
    description:
      'Add your course, subjects, career goals, and preferred study hours in under two minutes.',
  },
  {
    step: '02',
    title: 'Discover Ideal Partners & Groups',
    description:
      'Browse compatibility-ranked study partners and active groups tailored to your coursework.',
  },
  {
    step: '03',
    title: 'Collaborate & Stay Consistent',
    description:
      'Share notes, schedule group sessions, and hit your academic milestones together.',
  },
];

const STATS = [
  { value: '15+', label: 'Core CS & Tech Subjects' },
  { value: '100%', label: 'Compatibility Matchmaking' },
  { value: '4-Step', label: 'Quick Onboarding' },
  { value: '24/7', label: 'Resource Access' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              StudySync
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-indigo-100 text-xs font-medium mb-6 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              Peer-to-Peer Academic Collaboration Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Find Your People. Learn Together. Grow Together.
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10 leading-relaxed">
              Connect with compatible study partners, join focused study groups,
              share notes, and schedule collaborative sessions — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'}>
                <Button
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 from-white to-white shadow-lg w-full sm:w-auto"
                >
                  {isAuthenticated ? 'Open Dashboard' : 'Get Started Free'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Sign In to Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Everything you need to study smarter
          </h2>
          <p className="text-slate-600">
            Built for university and college students who want structured
            collaboration instead of scattered group chats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              How StudySync Works
            </h2>
            <p className="text-slate-600">
              Start collaborating with your ideal study circle in three simple
              steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <span className="inline-block text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">
                  STEP {item.step}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Ready to find your study squad?
            </h2>
            <p className="text-indigo-100 flex items-center gap-2 text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              Free for students. Set up your profile in less than 2 minutes.
            </p>
          </div>
          <Link to={isAuthenticated ? '/dashboard' : '/register'}>
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50 from-white to-white flex-shrink-0"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-slate-800">StudySync</span>
          </div>
          <p>© {new Date().getFullYear()} StudySync. Built for collaborative learning.</p>
        </div>
      </footer>
    </div>
  );
}
