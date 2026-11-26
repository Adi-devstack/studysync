import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  BookOpen,
  Calendar,
  Bell,
  Settings,
  LogOut,
  GraduationCap,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/partners', label: 'Find Partners', icon: Users },
  { to: '/groups', label: 'Study Groups', icon: UsersRound },
  { to: '/resources', label: 'Resources', icon: BookOpen },
  { to: '/sessions', label: 'Sessions', icon: Calendar },
  { to: '/notifications', label: 'Notifications', icon: Bell, showBadge: true },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              StudySync
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, showBadge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span>{label}</span>
                  </div>
                  {showBadge && unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-600 text-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Avatar src={user?.avatar_url} name={user?.full_name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.full_name || 'Student'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.course || user?.email || 'View Profile'}
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
