import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Repeat,
  PlusCircle,
  Layers,
  FileText,
  Upload,
  MessageSquare,
  ShieldCheck,
  Star,
  Wallet,
  TrendingUp,
  Heart,
  Eye,
  Trash2,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatBDT, formatDate } from '../utils/formatters';
import { RatingStars } from '../components/RatingStars';
import { DeliverWorkModal } from '../components/DeliverWorkModal';
import { ReviewModal } from '../components/ReviewModal';
import { WithdrawModal } from '../components/WithdrawModal';
import { Order, OrderStatus } from '../types';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';

  const { currentUser, currentMode, switchMode } = useAuth();
  const {
    orders,
    services,
    jobs,
    proposals,
    withdrawals,
    transactions,
    profiles,
    createService,
    deleteService,
    approveOrderAndReleaseEscrow,
    requestOrderRevision,
    savedFreelancerIds,
    toggleSaveFreelancer,
    createOrGetConversation,
  } = useData();

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Modals state
  const [deliverModalOrder, setDeliverModalOrder] = useState<Order | null>(null);
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [revisionOrder, setRevisionOrder] = useState<Order | null>(null);
  const [revisionNotesInput, setRevisionNotesInput] = useState('');

  // New service form state
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Web Development');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(15000);
  const [newServiceDays, setNewServiceDays] = useState(5);
  const [newServiceImage, setNewServiceImage] = useState(
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
  );

  // Filtered datasets based on current user
  const myFreelancerOrders = orders.filter((o) => o.freelancerId === currentUser?.uid);
  const myClientOrders = orders.filter((o) => o.clientId === currentUser?.uid);
  const myServices = services.filter((s) => s.freelancerId === currentUser?.uid);
  const myJobs = jobs.filter((j) => j.clientId === currentUser?.uid);
  const myProposals = proposals.filter((p) => p.freelancerId === currentUser?.uid);
  const myTransactions = transactions.filter((t) => t.userId === currentUser?.uid);
  const myWithdrawals = withdrawals.filter((w) => w.userId === currentUser?.uid);

  // Freelancer earnings chart data
  const earningsChartData = [
    { month: 'Jun', earnings: 15000 },
    { month: 'Jul', earnings: 28000 },
    { month: 'Aug', earnings: 22000 },
    { month: 'Sep', earnings: 38000 },
    { month: 'Oct', earnings: 45000 },
    { month: 'Nov', earnings: 52000 },
  ];

  // Client spending chart data
  const spendingChartData = [
    { month: 'Jun', spending: 20000 },
    { month: 'Jul', spending: 35000 },
    { month: 'Aug', spending: 18000 },
    { month: 'Sep', spending: 42000 },
    { month: 'Oct', spending: 50000 },
    { month: 'Nov', spending: 30000 },
  ];

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    createService({
      freelancerId: currentUser.uid,
      freelancerName: currentUser.displayName,
      freelancerAvatar: currentUser.photoURL,
      title: newServiceTitle,
      category: newServiceCategory,
      description: newServiceDesc,
      price: newServicePrice,
      deliveryTimeDays: newServiceDays,
      sampleImages: [newServiceImage],
    });
    setShowAddServiceModal(false);
    setNewServiceTitle('');
    setNewServiceDesc('');
  };

  const handleSendRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (revisionOrder && revisionNotesInput.trim()) {
      requestOrderRevision(revisionOrder.id, revisionNotesInput.trim());
      setRevisionOrder(null);
      setRevisionNotesInput('');
    }
  };

  const savedFreelancersList = profiles.filter((p) => savedFreelancerIds.includes(p.uid));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
        {/* Top Header & Role Switcher Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
              alt={currentUser?.displayName}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Welcome back, {currentUser?.displayName}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  {currentMode === 'freelancer' ? 'Freelancer Mode' : 'Client Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentMode === 'freelancer'
                  ? 'Manage your active gigs, client orders, and withdraw earnings in BDT.'
                  : 'Manage your job listings, hire talent, and release escrow payments.'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Pill */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => switchMode(currentMode === 'freelancer' ? 'client' : 'freelancer')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Repeat className="w-4 h-4" />
              <span>Switch to {currentMode === 'freelancer' ? 'Client View' : 'Freelancer View'}</span>
            </button>

            {currentMode === 'client' && (
              <Link
                to="/jobs/new"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Job</span>
              </Link>
            )}
          </div>
        </div>

        {/* ========================================================
            FREELANCER VIEW
           ======================================================== */}
        {currentMode === 'freelancer' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Active Orders</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {myFreelancerOrders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">In Progress</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Available Wallet</span>
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatBDT(currentUser?.walletBalance || 24500)}
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(true)}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
                >
                  Withdraw to bKash &rarr;
                </button>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Pending Escrow</span>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {formatBDT(myFreelancerOrders.filter((o) => o.status === 'In Progress' || o.status === 'Delivered').reduce((sum, o) => sum + o.freelancerEarnings, 0))}
                </div>
                <span className="text-[10px] text-slate-400">Locked safely until delivery</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Completed Orders</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {myFreelancerOrders.filter((o) => o.status === 'Completed').length}
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">4.95 ★ Rating</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 dark:border-slate-800 gap-2 text-xs font-bold pb-1">
              {[
                { id: 'overview', label: 'Active Orders & Analytics', icon: Layers },
                { id: 'services', label: `My Services (${myServices.length})`, icon: Briefcase },
                { id: 'proposals', label: `Proposals (${myProposals.length})`, icon: FileText },
                { id: 'wallet', label: 'Wallet & Withdrawals', icon: Wallet },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab 1: Overview & Orders */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Earnings Chart */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Monthly Earnings Growth (৳ BDT)
                      </h3>
                      <p className="text-xs text-slate-500">Total net payout delivered to your wallet</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                      +18.4% this month
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={earningsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="earningsColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: any) => [`৳${Number(value).toLocaleString('en-IN')}`, 'Earnings']}
                          contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px' }}
                        />
                        <Area type="monotone" dataKey="earnings" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#earningsColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Client Orders List
                  </h3>

                  {myFreelancerOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      No orders yet. Apply for jobs or create services to start receiving client orders!
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                            <th className="pb-3">Order #</th>
                            <th className="pb-3">Project Title</th>
                            <th className="pb-3">Client</th>
                            <th className="pb-3">Net Payout</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {myFreelancerOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="py-3 font-semibold text-slate-500">{ord.orderNumber}</td>
                              <td className="py-3 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                                {ord.title}
                              </td>
                              <td className="py-3 text-slate-600 dark:text-slate-300">{ord.clientName}</td>
                              <td className="py-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                                {formatBDT(ord.freelancerEarnings)}
                              </td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  ord.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'Delivered'
                                    ? 'bg-blue-100 text-blue-800'
                                    : ord.status === 'Revision'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="py-3 text-right space-x-2">
                                {(ord.status === 'In Progress' || ord.status === 'Revision') && (
                                  <button
                                    type="button"
                                    onClick={() => setDeliverModalOrder(ord)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                                  >
                                    Deliver Work
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const convId = createOrGetConversation(ord.clientId, ord.clientName, undefined, ord.id);
                                    window.location.href = `/chat?conv=${convId}`;
                                  }}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                  title="Chat with Client"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: My Services */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Skill Services You Offer
                    </h3>
                    <p className="text-xs text-slate-500">Clients can hire you directly from these service listings</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddServiceModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create New Service</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-sm space-y-4"
                    >
                      <div className="space-y-2">
                        <img
                          src={srv.sampleImages[0] || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'}
                          alt={srv.title}
                          className="w-full h-36 rounded-2xl object-cover"
                        />
                        <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                          {srv.category}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                          {srv.title}
                        </h4>
                        <div className="flex justify-between items-center text-xs pt-1">
                          <span className="text-slate-500">{srv.deliveryTimeDays} Days</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatBDT(srv.price)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <Link
                          to={`/services/${srv.id}`}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          View Public Page &rarr;
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteService(srv.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Proposals */}
            {activeTab === 'proposals' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  My Submitted Proposals
                </h3>

                {myProposals.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    You haven't submitted any proposals yet. Check out <Link to="/jobs" className="text-indigo-600 font-bold">Browse Jobs</Link> to apply!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myProposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <Link
                            to={`/jobs/${prop.jobId}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600"
                          >
                            {prop.jobTitle || 'Job Proposal'}
                          </Link>
                          <div className="text-[11px] text-slate-500">
                            Bid: <strong className="text-emerald-600">{formatBDT(prop.bidAmount)}</strong> &bull; {prop.deliveryDays} Days delivery
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            prop.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : prop.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {prop.status}
                          </span>
                          <Link
                            to={`/jobs/${prop.jobId}`}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            View Job
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Wallet & Withdrawals */}
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-indigo-700 text-white shadow-xl space-y-3">
                    <span className="text-xs text-emerald-100 font-medium">Available for Payout</span>
                    <div className="text-3xl font-extrabold">
                      {formatBDT(currentUser?.walletBalance || 24500)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setWithdrawModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-white text-slate-900 text-xs font-extrabold hover:bg-slate-100 shadow-md cursor-pointer"
                    >
                      Request Payout to bKash / Nagad
                    </button>
                  </div>

                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <span className="text-xs text-slate-400 font-medium">Pending in Escrow</span>
                    <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                      {formatBDT(18000)}
                    </div>
                    <p className="text-[11px] text-slate-500">Released automatically when client reviews work</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <span className="text-xs text-slate-400 font-medium">Total Withdrawn</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {formatBDT(myWithdrawals.filter((w) => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0) || 15000)}
                    </div>
                    <p className="text-[11px] text-slate-500">Dispatched to verified Bangladeshi accounts</p>
                  </div>
                </div>

                {/* Withdrawals list */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Recent Withdrawal Requests
                  </h3>
                  <div className="space-y-2">
                    {myWithdrawals.map((w) => (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {w.method} - {w.accountNumber}
                          </div>
                          <div className="text-[11px] text-slate-400">{formatDate(w.createdAt)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-slate-900 dark:text-white">{formatBDT(w.amount)}</div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            w.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {w.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            CLIENT VIEW
           ======================================================== */}
        {currentMode === 'client' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Posted Jobs</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {myJobs.length}
                </div>
                <Link to="/jobs/new" className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  + Post another job
                </Link>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Ongoing Projects</span>
                <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  {myClientOrders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled').length}
                </div>
                <span className="text-[10px] text-slate-400">Escrow protected</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Locked in Escrow</span>
                <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
                  {formatBDT(myClientOrders.filter((o) => o.status === 'In Progress' || o.status === 'Delivered').reduce((sum, o) => sum + o.amount, 0))}
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Guaranteed</span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-xs font-medium text-slate-500">Total Spent</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatBDT(myClientOrders.filter((o) => o.status === 'Completed').reduce((sum, o) => sum + o.amount, 0) || 65000)}
                </div>
                <span className="text-[10px] text-slate-400">Finished orders</span>
              </div>
            </div>

            {/* Client Tabs */}
            <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 dark:border-slate-800 gap-2 text-xs font-bold pb-1">
              {[
                { id: 'client_orders', label: `Ongoing Projects (${myClientOrders.length})`, icon: Layers },
                { id: 'client_jobs', label: `My Posted Jobs (${myJobs.length})`, icon: Briefcase },
                { id: 'client_saved', label: `Saved Freelancers (${savedFreelancersList.length})`, icon: Heart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Client Tab 1: Ongoing Projects & Delivery Approvals */}
            {(activeTab === 'client_orders' || activeTab === 'overview') && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Your Active Contracts & Escrow Orders
                  </h3>

                  {myClientOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      You don't have any orders yet. Accept a proposal or hire a freelancer to start!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myClientOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {ord.title}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                  ord.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'Delivered'
                                    ? 'bg-blue-100 text-blue-800 animate-pulse'
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {ord.status}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                Freelancer: <strong className="text-slate-800 dark:text-slate-200">{ord.freelancerName}</strong> &bull; Order #{ord.orderNumber}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Escrow Amount</span>
                              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                                {formatBDT(ord.amount)}
                              </span>
                            </div>
                          </div>

                          {/* Delivery Notes preview if delivered */}
                          {ord.status === 'Delivered' && ord.deliveryNotes && (
                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                              <div className="font-bold text-xs text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-blue-600" />
                                <span>Freelancer Submitted Work for Approval:</span>
                              </div>
                              <p className="text-xs text-blue-800 dark:text-blue-200 italic leading-relaxed">
                                "{ord.deliveryNotes}"
                              </p>
                              {ord.deliveryFiles && ord.deliveryFiles.length > 0 && (
                                <div className="pt-1">
                                  <a
                                    href={ord.deliveryFiles[0]}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Open Deliverable Files</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                const convId = createOrGetConversation(ord.freelancerId, ord.freelancerName, undefined, ord.id);
                                window.location.href = `/chat?conv=${convId}`;
                              }}
                              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message {ord.freelancerName}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              {ord.status === 'Delivered' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setRevisionOrder(ord)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                  >
                                    Request Revision
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => approveOrderAndReleaseEscrow(ord.id)}
                                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                                  >
                                    Approve & Release Escrow
                                  </button>
                                </>
                              )}

                              {ord.status === 'Completed' && !ord.clientRated && (
                                <button
                                  type="button"
                                  onClick={() => setReviewModalOrder(ord)}
                                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1"
                                >
                                  <Star className="w-3.5 h-3.5 fill-white" />
                                  <span>Rate Freelancer</span>
                                </button>
                              )}

                              {ord.status === 'Completed' && ord.clientRated && (
                                <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Reviewed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Client Tab 2: Posted Jobs */}
            {activeTab === 'client_jobs' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Jobs You Posted
                  </h3>
                  <Link
                    to="/jobs/new"
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm"
                  >
                    + Post New Job
                  </Link>
                </div>

                {myJobs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    You haven't posted any jobs yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myJobs.map((j) => (
                      <div
                        key={j.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <Link to={`/jobs/${j.id}`} className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600">
                            {j.title}
                          </Link>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Budget: <strong className="text-emerald-600">{formatBDT(j.budget)}</strong> &bull; {j.proposalsCount} proposals
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/jobs/${j.id}`}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                          >
                            Review Proposals ({j.proposalsCount})
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Client Tab 3: Saved Freelancers */}
            {activeTab === 'client_saved' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Favorite / Saved Freelancers
                </h3>

                {savedFreelancersList.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No freelancers bookmarked yet. Click the heart icon on any profile to save them here!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedFreelancersList.map((p) => (
                      <div
                        key={p.uid}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.uid === 'freelancer-001' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <Link to={`/profile/${p.uid}`} className="font-bold text-xs text-slate-900 dark:text-white hover:text-indigo-600">
                              {p.name}
                            </Link>
                            <div className="text-[11px] text-slate-500">{formatBDT(p.hourlyRate)}/hr</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/profile/${p.uid}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold"
                          >
                            Hire
                          </Link>
                          <button
                            type="button"
                            onClick={() => toggleSaveFreelancer(p.uid)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deliver Modal */}
      {deliverModalOrder && (
        <DeliverWorkModal
          isOpen={Boolean(deliverModalOrder)}
          onClose={() => setDeliverModalOrder(null)}
          order={deliverModalOrder}
        />
      )}

      {/* Review Modal */}
      {reviewModalOrder && (
        <ReviewModal
          isOpen={Boolean(reviewModalOrder)}
          onClose={() => setReviewModalOrder(null)}
          order={reviewModalOrder}
          role={currentMode === 'client' ? 'client' : 'freelancer'}
        />
      )}

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <WithdrawModal
          isOpen={withdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          availableBalance={currentUser?.walletBalance || 24500}
        />
      )}

      {/* Request Revision Modal */}
      {revisionOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Request Order Revision
            </h3>
            <p className="text-xs text-slate-500">
              Provide constructive feedback to {revisionOrder.freelancerName} on what adjustments are needed.
            </p>
            <textarea
              rows={4}
              required
              value={revisionNotesInput}
              onChange={(e) => setRevisionNotesInput(e.target.value)}
              placeholder="e.g. Please update the color contrast on mobile and fix the logo alignment..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevisionOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendRevision}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Create a Skill Service
              </h3>
              <button onClick={() => setShowAddServiceModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={newServiceTitle}
                  onChange={(e) => setNewServiceTitle(e.target.value)}
                  placeholder="I will build a responsive React web app..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Price (৳ BDT)</label>
                  <input
                    type="number"
                    required
                    min={500}
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Time (Days)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={newServiceDays}
                    onChange={(e) => setNewServiceDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Service Description</label>
                <textarea
                  rows={4}
                  required
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Detail the deliverables, technologies, and what the client receives..."
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
              >
                Publish Service ({formatBDT(newServicePrice)})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
