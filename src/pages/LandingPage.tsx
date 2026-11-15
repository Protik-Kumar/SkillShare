import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Code2,
  Palette,
  PenTool,
  Film,
  Languages,
  Database,
  GraduationCap,
  Users,
  Briefcase,
  Star,
  Quote,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { formatBDT } from '../utils/formatters';
import { RatingStars } from '../components/RatingStars';
import { MarketplaceInsightsSection } from '../components/MarketplaceInsightsSection';

export const LandingPage: React.FC = () => {
  const { categories, profiles, services, jobs } = useData();
  const { t } = useThemeLanguage();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/freelancers?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/freelancers');
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'Palette':
        return <Palette className="w-6 h-6 text-pink-600 dark:text-pink-400" />;
      case 'PenTool':
        return <PenTool className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'Film':
        return <Film className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      case 'Languages':
        return <Languages className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
      case 'Database':
        return <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      default:
        return <Briefcase className="w-6 h-6 text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-transparent to-transparent dark:from-indigo-950/20 dark:via-transparent pointer-events-none" />
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Skill-Based Hiring & Escrow Platform for Bangladesh</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200/80 dark:border-slate-700"
            >
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2 w-full">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('findTalent')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular quick tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Popular:</span>
              {['React', 'Figma', 'Video Editing', 'SEO Bangla', 'Flutter', 'Python'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => navigate(`/freelancers?skill=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="bg-white dark:bg-slate-900 py-8 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">৳2,50,000+</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Safely Paid via Escrow</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">100%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">bKash & Nagad Supported</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">4.95 ★</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Average Freelancer Rating</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">0%</div>
            <div className="text-xs font-medium text-slate-500 mt-1">Deposit Fee for Hirers</div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 md:py-24 max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('popularCategories')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore thousands of skilled professionals ready to deliver on your projects
            </p>
          </div>
          <Link
            to="/jobs"
            className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/freelancers?category=${encodeURIComponent(cat.name)}`}
              className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>{cat.jobCount} open jobs</span>
                <span className="text-emerald-600 dark:text-emerald-400">{cat.serviceCount} services</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Freelancers */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" /> Top Vetted Talent
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('featuredFreelancers')}
              </h2>
            </div>
            <Link
              to="/freelancers"
              className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>Explore All Freelancers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profiles.slice(0, 3).map((free) => (
              <div
                key={free.uid}
                className="rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <img
                      src={
                        free.uid === 'freelancer-001'
                          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
                          : free.uid === 'freelancer-002'
                          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
                          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={free.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md"
                    />
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Hourly Rate</span>
                      <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {formatBDT(free.hourlyRate)}/hr
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {free.name}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                    {free.headline}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                    {free.bio}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-xs">
                    <RatingStars rating={free.rating} reviewsCount={free.reviewCount} />
                    <span className="text-slate-500 font-medium">{free.completedJobs} jobs done</span>
                  </div>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {free.skills.slice(0, 4).map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Link
                    to={`/profile/${free.uid}`}
                    className="py-2.5 px-3 text-center rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-bold border border-slate-200 dark:border-slate-600 transition-colors"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/profile/${free.uid}?hire=1`}
                    className="py-2.5 px-3 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-colors"
                  >
                    Hire Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Insights (Search Grounded) */}
      <MarketplaceInsightsSection />

      {/* How it Works Section */}
      <section className="py-16 md:py-24 max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How SkillShare Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Secure, transparent, and built for seamless collaboration in Bangladesh
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Post a Job or Pick a Service</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Describe your project requirements or browse fixed-price services. Use our <strong>AI Skill Matcher</strong> to automatically find top-rated candidates.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Deposit to Protected Escrow</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deposit project funds in ৳ securely using <strong>bKash, Nagad, or Bank Card</strong>. Your money is locked in escrow and only released when you approve.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-extrabold text-xl flex items-center justify-center mx-auto shadow-md">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Approve & Review</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Review completed files and deliverables. Release escrow funds instantly to the freelancer's wallet, and rate their service.
            </p>
          </div>
        </div>
      </section>

      {/* Top Services */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('topRatedServices')}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Ready-to-buy services with upfront pricing and delivery times</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((srv) => (
              <Link
                key={srv.id}
                to={`/services/${srv.id}`}
                className="rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all group flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={srv.sampleImages[0] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
                    {srv.deliveryTimeDays} Days Delivery
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={srv.freelancerAvatar}
                        alt={srv.freelancerName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {srv.freelancerName}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {srv.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <RatingStars rating={srv.rating} reviewsCount={srv.reviewCount} size="sm" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Starting at</span>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatBDT(srv.price)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('testimonials')}
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Real stories from Bangladeshi businesses and skilled professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
            <Quote className="w-8 h-8 text-indigo-400 opacity-60" />
            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "We built our company e-commerce portal through SkillShare. Being able to pay securely using bKash escrow gave us complete peace of mind. Tanvir delivered exceptional code!"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"
                alt="Saadman"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Saadman Chowdhury</div>
                <div className="text-xs text-slate-500">Founder, Dhaka Tech Ventures</div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
            <Quote className="w-8 h-8 text-emerald-400 opacity-60" />
            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "As a UI/UX designer based in Chittagong, SkillShare helped me connect with serious local and international clients. Payouts arrive directly into my Nagad account on time."
            </p>
            <div className="flex items-center gap-3 pt-2">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
                alt="Farhana"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Farhana Yasmin</div>
                <div className="text-xs text-slate-500">Lead Product Designer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-emerald-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to hire or showcase your skills?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Join hundreds of Bangladeshi developers, designers, video editors, and marketers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm shadow-xl transition-all"
            >
              Get Started for Free
            </Link>
            <Link
              to="/jobs"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-sm border border-white/20 transition-all"
            >
              Browse Open Jobs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
