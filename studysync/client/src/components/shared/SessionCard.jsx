import React from 'react';
import { Calendar, Clock, MapPin, Users, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function SessionCard({
  session,
  currentUserId,
  onJoin,
  onLeave,
  onDelete,
  actionLoading = false,
}) {
  const isCreator = currentUserId && session.created_by === currentUserId;
  const isJoined =
    session.is_joined ||
    session.is_participant ||
    session.participant_status === 'joined';
  const participantCount =
    session.participant_count ?? session.participants_count ?? 0;
  const maxParticipants = session.max_participants ?? 10;
  const isFull = participantCount >= maxParticipants && !isJoined;

  const formattedDate = session.session_date
    ? new Date(session.session_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {session.subject && (
              <Badge variant="indigo">{session.subject}</Badge>
            )}
            {session.location === 'Online' ? (
              <Badge variant="green">Online</Badge>
            ) : (
              <Badge variant="blue">In-Person</Badge>
            )}
          </div>
          {isCreator && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(session.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete session"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1.5 line-clamp-1">
          {session.title}
        </h3>
        {session.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">
            {session.description}
          </p>
        )}

        <div className="space-y-2 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span>
              {session.start_time} – {session.end_time}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{session.location || 'Online'}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            {participantCount} / {maxParticipants} joined
          </span>
          {session.creator_name && (
            <span className="truncate max-w-[130px]">
              Host: {session.creator_name}
            </span>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100">
          {isJoined ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              loading={actionLoading}
              onClick={() => onLeave?.(session.id)}
            >
              Leave Session
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              disabled={isFull}
              loading={actionLoading}
              onClick={() => onJoin?.(session.id)}
            >
              {isFull ? 'Session Full' : 'Join Session'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
