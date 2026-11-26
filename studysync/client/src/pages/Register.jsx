import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = 'Full name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    else if (form.password.length < 6)
      next.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password)
      next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register(form.email.trim(), form.password, form.full_name.trim());
      toast.success('Account created! Let us personalize your profile.');
      navigate('/onboarding');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
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
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Join thousands of students learning together
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              name="full_name"
              icon={User}
              placeholder="Aarav Sharma"
              value={form.full_name}
              onChange={handleChange}
              error={errors.full_name}
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@university.edu"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              icon={Lock}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              icon={Lock}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              loading={submitting}
            >
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
