import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { t } = useThemeLanguage();
  const { categories } = useData();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      {/* Platform trust bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-6">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">100% Escrow Protection</div>
              <div className="text-xs text-slate-400">Funds are held safely in ৳ until you approve the work.</div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Verified Local Expertise</div>
              <div className="text-xs text-slate-400">Vetted Bangladeshi freelancers across 8+ skill categories.</div>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI-Powered Skill Matcher</div>
              <div className="text-xs text-slate-400">Gemini model pairs jobs with top candidates instantly.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Skill<span className="text-indigo-400">Share</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
              SkillShare is Bangladesh's dedicated skill-based marketplace. Freelancers showcase verified portfolios and earn in Bangladeshi Taka (৳) through bKash, Nagad, and local banking, while clients hire with zero friction.
            </p>
            <div className="text-xs text-slate-500">
              Platform Currency: <strong className="text-slate-300">BDT (৳)</strong> &bull; Date standard: <strong className="text-slate-300">DD MMM YYYY</strong>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Categories</h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/jobs?category=${encodeURIComponent(cat.name)}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">For Clients</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/freelancers" className="hover:text-white transition-colors">
                  Find Freelancers
                </Link>
              </li>
              <li>
                <Link to="/jobs/new" className="hover:text-white transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Manage Escrow & Orders
                </Link>
              </li>
              <li>
                <span className="text-slate-500">bKash & Nagad Escrow</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">For Freelancers</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/jobs" className="hover:text-white transition-colors">
                  Browse Available Jobs
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Freelancer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard?tab=wallet" className="hover:text-white transition-colors">
                  Withdraw to bKash / Nagad
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors text-indigo-400">
                  Admin Portal (Demo)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} SkillShare BD. {t('footerRights')}
          </div>
          <div className="flex items-center gap-1 mt-2 sm:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for the Bangladeshi Tech & Creative Community.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
