import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, SlidersHorizontal, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { SUBJECTS, COURSES, AVAILABILITY, ACADEMIC_YEARS } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import PartnerCard from '../components/shared/PartnerCard';

export default function FindPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    course: '',
    year: '',
    availability: '',
  });
  const [sortBy, setSortBy] = useState('compatibility');

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.subject) params.subject = filters.subject;
      if (filters.course) params.course = filters.course;
      if (filters.year) params.year = filters.year;
      if (filters.availability) params.availability = filters.availability;

      const res = await api.get('/users', { params });
      const list = res.data?.users || res.data || [];
      setPartners(list);
    } catch {
      toast.error('Failed to fetch study partners');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPartners]);

  const clearFilters = () => {
    setFilters({
      search: '',
      subject: '',
      course: '',
      year: '',
      availability: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const sortedPartners = [...partners].sort((a, b) => {
    if (sortBy === 'compatibility') {
      return (
        (b.compatibility ?? b.compatibility_score ?? 0) -
        (a.compatibility ?? a.compatibility_score ?? 0)
      );
    }
    return (a.full_name || '').localeCompare(b.full_name || '');
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Find Study Partners
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Connect with students matched by your subjects, goals, and schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="compatibility">Sort by Compatibility</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input
            icon={Search}
            placeholder="Search by name or bio..."
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
          />

          <select
            value={filters.subject}
            onChange={(e) =>
              setFilters((p) => ({ ...p, subject: e.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filters.course}
            onChange={(e) =>
              setFilters((p) => ({ ...p, course: e.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Courses</option>
            {COURSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) =>
              setFilters((p) => ({ ...p, year: e.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Years</option>
            {ACADEMIC_YEARS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>

          <select
            value={filters.availability}
            onChange={(e) =>
              setFilters((p) => ({ ...p, availability: e.target.value }))
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">Any Availability</option>
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Showing {sortedPartners.length} matching student
              {sortedPartners.length === 1 ? '' : 's'}
            </span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-3.5 h-3.5" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner size="lg" text="Finding compatible partners..." className="py-16" />
      ) : sortedPartners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching students found"
          description="Try adjusting your search or clearing some filters."
          actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedPartners.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}
    </div>
  );
}
