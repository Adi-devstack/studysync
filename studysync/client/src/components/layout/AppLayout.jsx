import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get('/notifications/count');
      const count = res.data?.count ?? res.data?.unreadCount ?? 0;
      setUnreadCount(Number(count) || 0);
    } catch {
      // Ignore silent polling errors
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, location.pathname, fetchUnreadCount]);

  if (loading) {
    return <LoadingSpinner fullScreen size="lg" text="Loading StudySync..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshUnreadCount: fetchUnreadCount }} />
        </main>
      </div>
    </div>
  );
}
