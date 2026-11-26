import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import FindPartners from './pages/FindPartners';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import Resources from './pages/Resources';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/partners" element={<FindPartners />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetails />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:id" element={<UserProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
