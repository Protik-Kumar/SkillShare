import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Bell,
  MessageSquare,
  Moon,
  Sun,
  User,
  LogOut,
  Shield,
  Layers,
  Repeat,
  Menu,
  X,
  PlusCircle,
  Wallet,
  CheckCircle2,
  Palette,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useThemeLanguage } from '../context/ThemeLanguageContext';
import { formatBDT } from '../utils/formatters';
import { THEME_PRESETS } from '../utils/themePresets';

export const Navbar: React.FC = () => {
  const { currentUser, currentMode, isAdmin, switchMode, logout, loginAsDemo } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const { isDark, toggleTheme, themePreset, setThemePreset, language, setLanguage, t } = useThemeLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  const handleToggleMode = () => {
    const nextMode = currentMode === 'freelancer' ? 'client' : 'freelancer';
    switchMode(nextMode);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-6 min-w-0 shrink-0">
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 dark:text-white truncate">
                    Skill<span className="text-indigo-600 dark:text-indigo-400">Share</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0">
                    BD
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-1 hidden xl:block truncate">
                  Skill-Based Hiring & Escrow
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Visible on lg >= 1024px) */}
            <nav className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-semibold">
              <Link
                to="/freelancers"
                className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg transition-colors whitespace-nowrap ${
                  location.pathname === '/freelancers'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {t('findTalent')}
              </Link>
              <Link
                to="/jobs"
                className={`px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-lg transition-colors whitespace-nowrap ${
                  location.pathname === '/jobs'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                {t('browseJobs')}
              </Link>
              <Link
                to="/jobs/new"
                className="flex items-center gap-1 px-2.5 xl:px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{t('postAJob')}</span>
              </Link>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Demo Switcher (Desktop only) */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => {
                  setDemoDropdownOpen(!demoDropdownOpen);
                  setProfileDropdownOpen(false);
                  setNotifDropdownOpen(false);
                  setThemeDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/80 hover:bg-amber-100 cursor-pointer"
                title="Quickly switch between pre-seeded test accounts"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Demo Accounts</span>
              </button>


              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs">
                  <div className="font-bold text-slate-500 dark:text-slate-400 px-2 py-1 uppercase text-[10px]">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => {
                      loginAsDemo('admin');
                      setDemoDropdownOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-indigo-600" /> Platform Admin
                      </div>
                      <div className="text-[11px] text-slate-500">admin@skillshare.com</div>
                    </div>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemo('freelancer');
                      setDemoDropdownOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Tanvir Ahmed</div>
                      <div className="text-[11px] text-slate-500">Senior Full-Stack Dev</div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      Freelancer
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      loginAsDemo('client');
                      setDemoDropdownOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Saadman Chowdhury</div>
                      <div className="text-[11px] text-slate-500">Dhaka Tech Ventures</div>
                    </div>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      Client
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Language Toggle (Desktop/Tablet) */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="hidden sm:block px-2 py-1 text-xs font-bold rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Toggle Language"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>

            {/* Color Theme Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setThemeDropdownOpen(!themeDropdownOpen);
                  setDemoDropdownOpen(false);
                  setProfileDropdownOpen(false);
                  setNotifDropdownOpen(false);
                }}
                aria-expanded={themeDropdownOpen}
                aria-label="Choose color theme"
                title="Switch color theme"
                className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs">
                  <div className="font-bold text-slate-500 dark:text-slate-400 px-2 py-1 uppercase text-[10px]">
                    Color Theme
                  </div>
                  <div className="space-y-1">
                    {THEME_PRESETS.map((preset) => {
                      const active = themePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setThemePreset(preset.id);
                            setThemeDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            active
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <span className="flex items-center shrink-0">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800"
                                style={{ backgroundColor: preset.swatchPrimary }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full -ml-1 border border-white dark:border-slate-800"
                                style={{ backgroundColor: preset.swatchSecondary }}
                              />
                            </span>
                            <span className="truncate">
                              <span className="block truncate">{preset.name}</span>
                              <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400 truncate">
                                {preset.description}
                              </span>
                            </span>
                          </span>
                          {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
            </button>

            {/* Notifications Popover */}
            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setProfileDropdownOpen(false);
                    setDemoDropdownOpen(false);
                    setThemeDropdownOpen(false);
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        Notifications ({notifications.length})
                      </span>
                      {unreadNotifs.length > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.link) navigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                              n.isRead
                                ? 'bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300'
                                : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white font-medium border-l-4 border-indigo-600'
                            }`}
                          >
                            <div className="font-semibold text-xs text-slate-900 dark:text-white mb-0.5">
                              {n.title}
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-300">
                              {n.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat button (Visible on lg >= 1024px) */}
            {currentUser && (
              <Link
                to="/chat"
                className="hidden lg:flex p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Open messages"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
            )}

            {/* Dual Role Switcher Button (Visible on xl >= 1280px) */}
            {currentUser && currentUser.role !== 'admin' && (
              <button
                type="button"
                onClick={handleToggleMode}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                  currentMode === 'freelancer'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-700'
                }`}
                title="Toggle between Freelancer Mode (earning) and Client Mode (hiring)"
              >
                <Repeat className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{currentMode === 'freelancer' ? 'Freelancer Mode' : 'Client Mode'}</span>
              </button>
            )}

            {/* Admin Badge link if admin (Visible on lg >= 1024px) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors shrink-0 whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotifDropdownOpen(false);
                    setDemoDropdownOpen(false);
                    setThemeDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-400 dark:hover:ring-indigo-600 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={currentUser.displayName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {currentUser.displayName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Wallet: {formatBDT(currentUser.walletBalance)}</span>
                        {currentUser.isVerified && (
                          <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:hidden px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                      <button
                        onClick={handleToggleMode}
                        className="w-full text-left font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Switch to {currentMode === 'freelancer' ? 'Client' : 'Freelancer'} Mode</span>
                      </button>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                    >
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <span>{t('dashboard')}</span>
                    </Link>

                    <Link
                      to={`/profile/${currentUser.uid}`}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                    >
                      <User className="w-4 h-4 text-indigo-500" />
                      <span>My Public Profile</span>
                    </Link>

                    <Link
                      to="/dashboard?tab=wallet"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                    >
                      <Wallet className="w-4 h-4 text-emerald-500" />
                      <span>Wallet & Escrow</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 font-semibold"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile & Tablet Menu Button - ON-SCREEN on all screens < 1024px */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 lg:hidden rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-4 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Quick Demo Switcher on Mobile */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Quick Demo Personas</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  loginAsDemo('admin');
                  setMobileMenuOpen(false);
                  navigate('/admin');
                }}
                className="py-1.5 px-2 text-center rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemo('freelancer');
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="py-1.5 px-2 text-center rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold"
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsDemo('client');
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="py-1.5 px-2 text-center rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold"
              >
                Client
              </button>
            </div>
          </div>

          {/* Theme Presets & Language Toggle in Mobile Drawer */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-2 text-xs">
            <div className="font-semibold text-slate-700 dark:text-slate-300">Color Theme</div>
            <div className="grid grid-cols-2 gap-1.5">
              {THEME_PRESETS.map((preset, idx) => {
                const active = themePreset === preset.id;
                const spanFull = THEME_PRESETS.length % 2 === 1 && idx === 0;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setThemePreset(preset.id)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left font-medium cursor-pointer ${
                      spanFull ? 'col-span-2' : ''
                    } ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 border ${
                        active ? 'border-white/90 ring-1 ring-white/40' : 'border-black/15 dark:border-white/25'
                      }`}
                      style={{ backgroundColor: preset.swatchPrimary }}
                    />
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Language / ভাষা:
            </span>
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-3 py-1 font-bold rounded-lg bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-slate-600"
            >
              {language === 'en' ? 'বাংলায় দেখুন' : 'English'}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link
              to="/freelancers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('findTalent')}
            </Link>
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('browseJobs')}
            </Link>
            <Link
              to="/jobs/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100"
            >
              + {t('postAJob')}
            </Link>
          </div>

          {/* User state in Mobile Drawer */}
          {currentUser ? (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={currentUser.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {currentUser.displayName}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      Wallet: {formatBDT(currentUser.walletBalance)}
                    </div>
                  </div>
                </div>
              </div>

              {currentUser.role !== 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    handleToggleMode();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/60"
                >
                  <span className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    <span>Mode: {currentMode === 'freelancer' ? 'Freelancer (Earning)' : 'Client (Hiring)'}</span>
                  </span>
                  <span className="text-xs underline">Switch</span>
                </button>
              )}

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>{t('dashboard')}</span>
              </Link>

              <Link
                to={`/profile/${currentUser.uid}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span>My Public Profile</span>
              </Link>

              <Link
                to="/dashboard?tab=wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Wallet className="w-4 h-4 text-emerald-500" />
                <span>Wallet & Escrow</span>
              </Link>

              <Link
                to="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span>Messages & Contracts</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-bold rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700"
              >
                {t('register')} - Get Started
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('login')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

