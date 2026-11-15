import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Send,
  PlusCircle,
  SlidersHorizontal,
  Calendar,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatBDT, formatDate } from '../utils/formatters';
import {
  HourlyRateRangeFilter,
  SkillCategoriesFilter,
} from '../components/MarketplaceFilterSections';
import {
  DEFAULT_MAX_RATE,
  DEFAULT_MIN_RATE,
  estimateJobHourlyRate,
  filterJobs,
} from '../utils/marketplaceFilters';

export const BrowseJobsPage: React.FC = () => {
  const { jobs, categories } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategoryParam = searchParams.get('category');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoryParam && initialCategoryParam !== 'All' ? [initialCategoryParam] : []
  );
  const [minHourlyRate, setMinHourlyRate] = useState<number>(DEFAULT_MIN_RATE);
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(DEFAULT_MAX_RATE);
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'latest' | 'budget_high' | 'proposals'>('latest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync URL search params when navigating from other pages
  useEffect(() => {
    const qParam = searchParams.get('q');
    const catParam = searchParams.get('category');
    if (qParam !== null) setQuery(qParam);
    if (catParam && catParam !== 'All') {
      setSelectedCategories([catParam]);
    }
  }, [searchParams]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of categories) counts[c.name] = 0;
    for (const j of jobs) {
      if (j.status === 'cancelled' || j.status === 'flagged') continue;
      counts[j.category] = (counts[j.category] || 0) + 1;
    }
    return counts;
  }, [categories, jobs]);

  const filteredJobs = useMemo(() => {
    return filterJobs(jobs, {
      query,
      selectedCategories,
      minHourlyRate,
      maxHourlyRate,
      openOnly,
    });
  }, [jobs, query, selectedCategories, minHourlyRate, maxHourlyRate, openOnly]);

  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'budget_high') return b.budget - a.budget;
      if (sortBy === 'proposals') return (b.proposalsCount || 0) - (a.proposalsCount || 0);
      return 0;
    });
  }, [filteredJobs, sortBy]);

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setMinHourlyRate(DEFAULT_MIN_RATE);
    setMaxHourlyRate(DEFAULT_MAX_RATE);
    setOpenOnly(false);
    setSortBy('latest');
    setSearchParams({});
  };

  const activeFiltersCount =
    (query.trim() ? 1 : 0) +
    selectedCategories.length +
    (minHourlyRate > DEFAULT_MIN_RATE || maxHourlyRate < DEFAULT_MAX_RATE ? 1 : 0) +
    (openOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Browse Freelance Jobs &amp; Projects
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Apply to active projects in Bangladesh with guaranteed escrow milestone payments.
            </p>
          </div>
          <Link
            to="/jobs/new"
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Job</span>
          </Link>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            aria-expanded={mobileFilterOpen}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}</span>
          </button>
          <span className="text-xs text-slate-500 font-semibold tabular-nums">
            {sortedJobs.length} jobs found
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtering Sidebar */}
          <aside
            aria-label="Job filters"
            className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1`}
          >
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    aria-label="Close job filters"
                    className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Keyword Search */}
              <div>
                <label
                  htmlFor="job-keyword-search"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Keyword / Skill
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="job-keyword-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Flutter, Next.js, SEO..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Skill Categories */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <SkillCategoriesFilter
                  categories={categories}
                  selectedCategories={selectedCategories}
                  categoryCounts={categoryCounts}
                  onToggleCategory={toggleCategory}
                  onClearCategories={() => setSelectedCategories([])}
                />
              </div>

              {/* Hourly Rate Range */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <HourlyRateRangeFilter
                  minRate={minHourlyRate}
                  maxRate={maxHourlyRate}
                  onChangeRange={(min, max) => {
                    setMinHourlyRate(min);
                    setMaxHourlyRate(max);
                  }}
                  helperText="Estimated equivalent hourly rate based on project budget."
                />
              </div>

              {/* Job Status Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span className="font-semibold">Open for Proposals Only</span>
                  <input
                    type="checkbox"
                    checked={openOnly}
                    onChange={(e) => setOpenOnly(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </aside>

          {/* Jobs Results Column */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Results Toolbar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="font-semibold tabular-nums">
                  Showing <strong className="text-slate-900 dark:text-white">{sortedJobs.length}</strong> matching projects
                </span>
                {selectedCategories.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {selectedCategories.join(', ')}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="jobs-sort" className="text-slate-500">Sort by:</label>
                <select
                  id="jobs-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold outline-none"
                >
                  <option value="latest">Newest First</option>
                  <option value="budget_high">Highest Budget</option>
                  <option value="proposals">Most Proposals</option>
                </select>
              </div>
            </div>

            {/* Jobs List */}
            {sortedJobs.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">No jobs match your filters</h3>
                <p className="text-xs text-slate-500">Try widening your hourly rate range or clearing selected categories.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              sortedJobs.map((j) => {
                const estHourly = estimateJobHourlyRate(j);
                return (
                  <div
                    key={j.id}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {j.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>Posted {formatDate(j.createdAt)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            by {j.clientName}
                          </span>
                        </div>

                        <Link
                          to={`/jobs/${j.id}`}
                          className="block font-extrabold text-base sm:text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                        >
                          {j.title}
                        </Link>

                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {j.description}
                        </p>

                        {/* Skill buttons */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {j.requiredSkills.map((sk) => (
                            <button
                              key={sk}
                              type="button"
                              onClick={() => setQuery(sk)}
                              className="px-2.5 py-0.5 text-[11px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                            >
                              {sk}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right side info */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 pt-3 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-slate-400">Project Budget</span>
                          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {formatBDT(j.budget)}
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                            Est. {formatBDT(estHourly)}/hr
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            <span>Deadline: {formatDate(j.deadline)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 tabular-nums">
                            {j.proposalsCount || 0} proposals
                          </span>
                          <Link
                            to={`/jobs/${j.id}`}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Apply</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
