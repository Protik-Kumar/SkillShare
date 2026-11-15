import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CheckCircle2,
  Heart,
  Briefcase,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatBDT } from '../utils/formatters';
import { RatingStars } from '../components/RatingStars';
import {
  HourlyRateRangeFilter,
  SkillCategoriesFilter,
} from '../components/MarketplaceFilterSections';
import {
  DEFAULT_MAX_RATE,
  DEFAULT_MIN_RATE,
  filterFreelancers,
  getProfileCategories,
} from '../utils/marketplaceFilters';

export const BrowseFreelancersPage: React.FC = () => {
  const { profiles, services, categories, toggleSaveFreelancer, isFreelancerSaved } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategoryParam = searchParams.get('category');
  const [query, setQuery] = useState(searchParams.get('q') || searchParams.get('skill') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoryParam && initialCategoryParam !== 'All' ? [initialCategoryParam] : []
  );
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [minHourlyRate, setMinHourlyRate] = useState<number>(DEFAULT_MIN_RATE);
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(DEFAULT_MAX_RATE);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'rate_low' | 'rate_high'>('rating');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync URL query params when navigating from LandingPage or Footer links
  useEffect(() => {
    const qParam = searchParams.get('q') || searchParams.get('skill');
    const catParam = searchParams.get('category');
    if (qParam !== null) setQuery(qParam);
    if (catParam && catParam !== 'All') {
      setSelectedCategories([catParam]);
    }
  }, [searchParams]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of categories) counts[c.name] = 0;
    for (const p of profiles) {
      const cats = getProfileCategories(p, services);
      for (const cat of cats) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }
    return counts;
  }, [categories, profiles, services]);

  const filteredProfiles = useMemo(() => {
    return filterFreelancers(profiles, services, {
      query,
      selectedCategories,
      selectedLevel,
      minHourlyRate,
      maxHourlyRate,
      minRating,
      selectedLocation,
    });
  }, [
    profiles,
    services,
    query,
    selectedCategories,
    selectedLevel,
    minHourlyRate,
    maxHourlyRate,
    minRating,
    selectedLocation,
  ]);

  const sortedProfiles = useMemo(() => {
    return [...filteredProfiles].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'jobs') return b.completedJobs - a.completedJobs;
      if (sortBy === 'rate_low') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'rate_high') return b.hourlyRate - a.hourlyRate;
      return 0;
    });
  }, [filteredProfiles, sortBy]);

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategories([]);
    setSelectedLevel('All');
    setMinHourlyRate(DEFAULT_MIN_RATE);
    setMaxHourlyRate(DEFAULT_MAX_RATE);
    setMinRating(0);
    setSelectedLocation('All');
    setSortBy('rating');
    setSearchParams({});
  };

  const activeFiltersCount =
    (query.trim() ? 1 : 0) +
    selectedCategories.length +
    (selectedLevel !== 'All' ? 1 : 0) +
    (minHourlyRate > DEFAULT_MIN_RATE || maxHourlyRate < DEFAULT_MAX_RATE ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (selectedLocation !== 'All' ? 1 : 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Find Skilled Freelancers in Bangladesh
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hire verified experts with verified skills and escrow protection in Bangladeshi Taka (৳).
          </p>
        </div>

        {/* Mobile Filter toggle */}
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
            {sortedProfiles.length} freelancers found
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside
            aria-label="Freelancer filters"
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
                    aria-label="Close filters"
                    className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search keyword */}
              <div>
                <label
                  htmlFor="freelancer-keyword-search"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Keyword / Skill
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="freelancer-keyword-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. React, Figma, SEO..."
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
                />
              </div>

              {/* Skill level */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Skill Level
                </label>
                <div className="space-y-1.5 text-xs">
                  {['All', 'Expert', 'Intermediate', 'Beginner'].map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                      <input
                        type="radio"
                        name="skillLevel"
                        checked={selectedLevel === lvl}
                        onChange={() => setSelectedLevel(lvl)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: 'Any Rating', val: 0 },
                    { label: '4.8 & Above ★', val: 4.8 },
                    { label: '4.5 & Above ★', val: 4.5 },
                    { label: '4.0 & Above ★', val: 4.0 },
                  ].map((item) => (
                    <label key={item.val} className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === item.val}
                        onChange={() => setMinRating(item.val)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label
                  htmlFor="freelancer-location-select"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Location in BD
                </label>
                <select
                  id="freelancer-location-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="All">All Regions</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Toolbar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="font-semibold tabular-nums">
                  Showing <strong className="text-slate-900 dark:text-white">{sortedProfiles.length}</strong> verified professionals
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
                <label htmlFor="freelancer-sort" className="text-slate-500">Sort by:</label>
                <select
                  id="freelancer-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold outline-none"
                >
                  <option value="rating">Top Rated</option>
                  <option value="jobs">Most Completed Jobs</option>
                  <option value="rate_low">Rate: Low to High</option>
                  <option value="rate_high">Rate: High to Low</option>
                </select>
              </div>
            </div>

            {/* Profiles Cards */}
            {sortedProfiles.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">No freelancers found</h3>
                <p className="text-xs text-slate-500">Try adjusting your selected categories, hourly rate range, or keywords.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              sortedProfiles.map((p) => {
                const isSaved = isFreelancerSaved(p.uid);

                return (
                  <div
                    key={p.uid}
                    className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:shadow-xl transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      {/* Avatar & Info */}
                      <div className="flex items-start gap-4">
                        <img
                          src={
                            p.uid === 'freelancer-001'
                              ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
                              : p.uid === 'freelancer-002'
                              ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
                              : p.uid === 'freelancer-003'
                              ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
                              : p.uid === 'freelancer-004'
                              ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
                              : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80'
                          }
                          alt={p.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md shrink-0"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              to={`/profile/${p.uid}`}
                              className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                              {p.name}
                            </Link>
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Verified</span>
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              · {p.skillLevel}
                            </span>
                          </div>

                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                            {p.headline}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                            <RatingStars rating={p.rating} reviewsCount={p.reviewCount} size="sm" />
                            <span>&bull;</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                              {p.completedJobs} jobs done
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <MapPin className="w-3 h-3" />
                              {p.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rate & Actions */}
                      <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left sm:text-right">
                          <span className="text-[11px] text-slate-400">Hourly Rate</span>
                          <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                            {formatBDT(p.hourlyRate)}/hr
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSaveFreelancer(p.uid)}
                            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                              isSaved
                                ? 'bg-rose-50 border-rose-300 text-rose-500 dark:bg-rose-950/40 dark:border-rose-800'
                                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300'
                            }`}
                            aria-label="Save freelancer"
                          >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
                          </button>

                          <Link
                            to={`/profile/${p.uid}`}
                            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 transition-colors whitespace-nowrap"
                          >
                            View &amp; Hire
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-3 leading-relaxed">
                      {p.bio}
                    </p>

                    {/* Skills filter buttons */}
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {p.skills.map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => setQuery(skill)}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors cursor-pointer"
                        >
                          {skill}
                        </button>
                      ))}
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
