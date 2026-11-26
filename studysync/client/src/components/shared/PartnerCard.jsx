import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Sparkles, ArrowRight, Clock } from 'lucide-react';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { parseJsonArray } from '../../constants';

function getScoreBadgeClass(score) {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (score >= 25) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

export default function PartnerCard({ partner }) {
  const subjects = parseJsonArray(partner.subjects);
  const availability = parseJsonArray(partner.availability);
  const reasons = Array.isArray(partner.reasons) ? partner.reasons : [];
  const score =
    typeof partner.compatibility === 'number'
      ? Math.round(partner.compatibility)
      : typeof partner.compatibility_score === 'number'
      ? Math.round(partner.compatibility_score)
      : typeof partner.score === 'number'
      ? Math.round(partner.score)
      : null;

  return (
    <Card className="flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={partner.avatar_url}
              name={partner.full_name}
              size="lg"
            />
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900 truncate">
                {partner.full_name}
              </h3>
              <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span>
                  {partner.course || 'Student'}
                  {partner.academic_year ? ` • Year ${partner.academic_year}` : ''}
                </span>
              </p>
              {partner.college && (
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {partner.college}
                </p>
              )}
            </div>
          </div>

          {score !== null && (
            <div
              className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1 flex-shrink-0 ${getScoreBadgeClass(
                score
              )}`}
            >
              <Sparkles className="w-3 h-3" />
              {score}%
            </div>
          )}
        </div>

        {/* Bio */}
        {partner.bio && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {partner.bio}
          </p>
        )}

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">
              Subjects
            </p>
            <div className="flex flex-wrap gap-1.5">
              {subjects.slice(0, 4).map((subj) => (
                <Badge key={subj} variant="indigo">
                  {subj}
                </Badge>
              ))}
              {subjects.length > 4 && (
                <Badge variant="slate">+{subjects.length - 4}</Badge>
              )}
            </div>
          </div>
        )}

        {/* Match Reasons */}
        {reasons.length > 0 && (
          <div className="mb-3 space-y-1">
            {reasons.slice(0, 2).map((reason, idx) => (
              <p
                key={idx}
                className="text-xs text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-md"
              >
                {reason}
              </p>
            ))}
          </div>
        )}

        {/* Availability */}
        {availability.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{availability.slice(0, 2).join(', ')}</span>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link to={`/users/${partner.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
