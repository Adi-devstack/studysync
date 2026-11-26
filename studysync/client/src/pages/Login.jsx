import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = 'Enter a valid email';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user?.full_name || 'Student'}!`);
      if (user && user.profile_completed === 0) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid email or password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            StudySync
          </span>
        </Link>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Sign in to continue your study sessions
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email Address"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              icon={Lock}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={submitting}
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
