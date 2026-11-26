import React from 'react';
import {
  UsersRound,
  Calendar,
  BookOpen,
  Sparkles,
  UserCheck,
  Bell,
} from 'lucide-react';

function getNotificationIcon(type) {
  switch (type) {
    case 'group_invite':
    case 'group_join_request':
      return { Icon: UsersRound, bg: 'bg-indigo-50 text-indigo-600' };
    case 'group_join_approved':
      return { Icon: UserCheck, bg: 'bg-emerald-50 text-emerald-600' };
    case 'session_reminder':
      return { Icon: Calendar, bg: 'bg-blue-50 text-blue-600' };
    case 'resource_shared':
      return { Icon: BookOpen, bg: 'bg-amber-50 text-amber-600' };
    case 'partner_match':
      return { Icon: Sparkles, bg: 'bg-violet-50 text-violet-600' };
    default:
      return { Icon: Bell, bg: 'bg-slate-100 text-slate-600' };
  }
}

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationItem({ notification, onClick }) {
  const { Icon, bg } = getNotificationIcon(notification.type);
  const isUnread = !notification.is_read;

  return (
    <div
      onClick={() => onClick?.(notification)}
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isUnread
          ? 'bg-indigo-50/40 border-indigo-200 hover:bg-indigo-50/70'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm ${
              isUnread
                ? 'font-semibold text-slate-900'
                : 'font-medium text-slate-800'
            }`}
          >
            {notification.title}
          </p>
          <span className="text-xs text-slate-400 flex-shrink-0">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-0.5">{notification.message}</p>
      </div>

      {isUnread && (
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}
