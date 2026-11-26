import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Lock, Globe, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const CATEGORY_LABELS = {
  study: { label: 'Study Group', variant: 'indigo' },
  project: { label: 'Project Team', variant: 'purple' },
  exam_prep: { label: 'Exam Prep', variant: 'yellow' },
  discussion: { label: 'Discussion', variant: 'blue' },
};

export default function GroupCard({
  group,
  onJoin,
  onLeave,
  actionLoading = false,
}) {
  const cat = CATEGORY_LABELS[group.category] || {
    label: group.category || 'Study',
    variant: 'indigo',
  };

  const memberCount = group.member_count ?? group.members_count ?? 0;
  const maxMembers = group.max_members ?? 20;
  const isMember =
    group.is_member ||
    group.membership_status === 'approved' ||
    group.user_status === 'approved';
  const isPending =
    group.membership_status === 'pending' || group.user_status === 'pending';

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {group.subject && <Badge variant="indigo">{group.subject}</Badge>}
            <Badge variant={cat.variant}>{cat.label}</Badge>
          </div>
          <span
            className="inline-flex items-center gap-1 text-xs text-slate-500 flex-shrink-0"
            title={group.is_private ? 'Private Group' : 'Public Group'}
          >
            {group.is_private ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                Private
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                Public
              </>
            )}
          </span>
        </div>

        <Link to={`/groups/${group.id}`}>
          <h3 className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors mb-1.5 line-clamp-1">
            {group.name}
          </h3>
        </Link>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {group.description || 'No description provided.'}
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="inline-flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              {memberCount} / {maxMembers} members
            </span>
          </span>
          {group.creator_name && (
            <span className="truncate max-w-[130px]">
              by {group.creator_name}
            </span>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Link to={`/groups/${group.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              Details
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>

          {isMember ? (
            onLeave && (
              <Button
                variant="ghost"
                size="sm"
                loading={actionLoading}
                onClick={() => onLeave(group.id)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Leave
              </Button>
            )
          ) : isPending ? (
            <Badge variant="yellow" size="md">
              Pending
            </Badge>
          ) : (
            onJoin && (
              <Button
                variant="primary"
                size="sm"
                loading={actionLoading}
                onClick={() => onJoin(group.id)}
              >
                {group.is_private ? 'Request' : 'Join'}
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
}
