import React, { useState } from 'react';
import {
  Shield,
  Users,
  Briefcase,
  DollarSign,
  AlertTriangle,
  Settings,
  CheckCircle2,
  XCircle,
  Trash2,
  Plus,
  Send,
  Flag,
  Percent,
  Layers,
  FileText,
  Search,
  Check,
  Ban,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatBDT, formatDate } from '../utils/formatters';

const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export const AdminPanelPage: React.FC = () => {
  const {
    categories,
    profiles,
    jobs,
    services,
    orders,
    withdrawals,
    transactions,
    reports,
    reviews,
    settings,
    updateSettings,
    approveWithdrawal,
    rejectWithdrawal,
    deleteJob,
    deleteService,
    deleteReview,
    updateReportStatus,
    suspendUser,
  } = useData();

  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'jobs_services' | 'orders_escrow' | 'withdrawals' | 'reports' | 'reviews' | 'settings'
  >('overview');

  const [userSearch, setUserSearch] = useState('');
  const [announcementInput, setAnnouncementInput] = useState(settings.announcement || '');
  const [commissionInput, setCommissionInput] = useState(settings.commissionRate);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Computed platform metrics
  const totalUsers = profiles.length + 3; // Freelancers + clients
  const totalJobs = jobs.length;
  const totalServices = services.length;
  const totalOrders = orders.length;
  const totalEscrowVolume = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalPlatformRevenue = orders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'pending').length;

  // Chart data
  const categoryData = categories.slice(0, 6).map((c) => ({
    name: c.name,
    jobs: c.jobCount,
  }));

  const revenueMonthlyData = [
    { month: 'Jun', revenue: 4500 },
    { month: 'Jul', revenue: 8200 },
    { month: 'Aug', revenue: 6700 },
    { month: 'Sep', revenue: 11400 },
    { month: 'Oct', revenue: 15200 },
    { month: 'Nov', revenue: 18900 },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      commissionRate: Number(commissionInput),
      announcement: announcementInput,
    });
    alert('Settings updated successfully!');
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;
    updateSettings({ announcement: `${broadcastTitle}: ${broadcastMsg}` });
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setBroadcastTitle('');
      setBroadcastMsg('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
        {/* Top Header */}
        <div className="p-6 rounded-3xl bg-indigo-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">Admin Master Console</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Logged in as {currentUser?.email || 'admin@skillshare.com'} &bull; Full platform authority
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-white/10 font-bold">
              Commission Rate: {settings.commissionRate}%
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {pendingWithdrawalsCount} Pending Payouts
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 gap-1.5 text-xs font-bold pb-2 no-scrollbar">
          {[
            { id: 'overview', label: 'Platform Analytics', icon: TrendingUp },
            { id: 'users', label: `Users (${totalUsers})`, icon: Users },
            { id: 'jobs_services', label: `Jobs & Services (${totalJobs + totalServices})`, icon: Briefcase },
            { id: 'orders_escrow', label: `Orders & Escrow (${totalOrders})`, icon: DollarSign },
            { id: 'withdrawals', label: `Withdrawals (${withdrawals.length})`, icon: Layers },
            { id: 'reports', label: `Reports (${reports.length})`, icon: Flag },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: CheckCircle2 },
            { id: 'settings', label: 'Settings & Broadcast', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================
            TAB 1: PLATFORM ANALYTICS
           ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Total Users</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalUsers}</div>
                <span className="text-[10px] text-emerald-600 font-semibold">5 Freelancers, 3 Clients</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Total Escrow Volume</span>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatBDT(totalEscrowVolume)}
                </div>
                <span className="text-[10px] text-slate-400">Bangladeshi Taka (৳)</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Platform Commission</span>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatBDT(totalPlatformRevenue)}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">{settings.commissionRate}% Take Rate</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Jobs & Services</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalJobs + totalServices}
                </div>
                <span className="text-[10px] text-slate-400">{totalJobs} Jobs, {totalServices} Gigs</span>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Revenue Chart */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Monthly Platform Revenue (৳ BDT)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any) => [`৳${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px' }}
                      />
                      <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Jobs per Category */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Jobs Distribution by Category
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="jobs"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => entry.name}
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: USER MANAGEMENT
           ======================================================== */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Platform Users ({profiles.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name or location..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Rate</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3">Completed Jobs</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Moderation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {profiles
                    .filter((p) => p.name.toLowerCase().includes(userSearch.toLowerCase()))
                    .map((p) => (
                      <tr key={p.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>{p.name}</span>
                        </td>
                        <td className="py-3 text-slate-500">{p.location}</td>
                        <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {formatBDT(p.hourlyRate)}/hr
                        </td>
                        <td className="py-3 font-semibold text-amber-500">{p.rating} ★</td>
                        <td className="py-3 text-slate-500">{p.completedJobs}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.availability === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.availability}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => suspendUser(p.uid, p.availability === 'Available')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                              p.availability === 'Available'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            }`}
                          >
                            {p.availability === 'Available' ? 'Suspend' : 'Unban'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: JOBS & SERVICES MODERATION
           ======================================================== */}
        {activeTab === 'jobs_services' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Jobs */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Active Job Listings ({jobs.length})
              </h3>
              <div className="space-y-3">
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{j.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {j.clientName} &bull; Budget: <strong className="text-emerald-600">{formatBDT(j.budget)}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteJob(j.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                      title="Remove Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Active Services ({services.length})
              </h3>
              <div className="space-y-3">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{s.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {s.freelancerName} &bull; Price: <strong className="text-emerald-600">{formatBDT(s.price)}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteService(s.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                      title="Remove Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ORDERS & ESCROW MANAGEMENT
           ======================================================== */}
        {activeTab === 'orders_escrow' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Platform Escrow Contracts ({orders.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Freelancer</th>
                    <th className="pb-3">Escrow (৳)</th>
                    <th className="pb-3">Fee (৳)</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{o.orderNumber}</td>
                      <td className="py-3 text-slate-500">{o.clientName}</td>
                      <td className="py-3 text-slate-500">{o.freelancerName}</td>
                      <td className="py-3 font-extrabold text-emerald-600 dark:text-emerald-400">{formatBDT(o.amount)}</td>
                      <td className="py-3 text-slate-500">{formatBDT(o.commissionAmount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          o.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: WITHDRAWALS
           ======================================================== */}
        {activeTab === 'withdrawals' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Pending & Processed Withdrawals ({withdrawals.length})
            </h3>

            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {w.userName} requested {formatBDT(w.amount)} via {w.method}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Account: <strong>{w.accountNumber}</strong> ({w.accountName}) &bull; Date: {formatDate(w.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      w.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.status === 'rejected'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {w.status}
                    </span>

                    {w.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => approveWithdrawal(w.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Approve Payout
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectWithdrawal(w.id)}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 6: SETTINGS & BROADCAST
           ======================================================== */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Platform Settings */}
            <form onSubmit={handleSaveSettings} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Platform Rules & Take Rate
              </h3>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Commission Fee Rate (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                  <span className="text-slate-500">% of completed order value</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Platform Announcement Banner
                </label>
                <textarea
                  rows={3}
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
              >
                Save Platform Settings
              </button>
            </form>

            {/* Broadcast Notice */}
            <form onSubmit={handleSendBroadcast} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Broadcast Platform Announcement
              </h3>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Eid-ul-Fitr Special Promotion"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="e.g. 0% withdrawal fees on all bKash and Nagad transfers this week!"
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{broadcastSuccess ? 'Broadcasted!' : 'Send Platform Broadcast'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
