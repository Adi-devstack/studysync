import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

export default function Topbar({ onMenuClick, unreadCount = 0 }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            StudySync
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold bg-indigo-600 text-white rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
        >
          <Avatar src={user?.avatar_url} name={user?.full_name} size="sm" />
          <span className="hidden sm:block text-sm font-medium text-slate-700 pr-2">
            {user?.full_name?.split(' ')[0] || 'Profile'}
          </span>
        </Link>
      </div>
    </header>
  );
}
