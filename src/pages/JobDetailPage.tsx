import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  User,
  ShieldCheck,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatBDT, formatDate } from '../utils/formatters';
import { matchFreelancersWithAI, AIMatchResult } from '../lib/gemini';
import { AIProposalModal } from '../components/AIProposalModal';
import { EscrowPaymentModal } from '../components/EscrowPaymentModal';
import { RatingStars } from '../components/RatingStars';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobs, proposals, profiles, acceptProposal, rejectProposal, createOrGetConversation } = useData();
  const { currentUser, currentMode } = useAuth();

  const [aiMatches, setAiMatches] = useState<AIMatchResult[]>([]);
  const [loadingAi, setLoadingAi] = useState(true);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [selectedProposalToAccept, setSelectedProposalToAccept] = useState<string | null>(null);

  const job = jobs.find((j) => j.id === id);

  // Proposals for this job
  const jobProposals = proposals.filter((p) => p.jobId === id);
  const isJobOwner = currentUser && job && currentUser.uid === job.clientId;
  const userExistingProposal = currentUser ? jobProposals.find((p) => p.freelancerId === currentUser.uid) : null;

  // Run AI Skill Matcher on mount
  useEffect(() => {
    if (!job) return;
    let isMounted = true;
    setLoadingAi(true);

    matchFreelancersWithAI(job.title, job.description, job.requiredSkills, profiles)
      .then((results) => {
        if (isMounted) {
          setAiMatches(results);
          setLoadingAi(false);
        }
      })
      .catch((err) => {
        console.warn('AI matching error:', err);
        if (isMounted) setLoadingAi(false);
      });

    return () => {
      isMounted = false;
    };
  }, [job, profiles]);

  if (!job) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Job not found</h2>
        <Link to="/jobs" className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          &larr; Back to all jobs
        </Link>
      </div>
    );
  }

  const handleStartAcceptProposal = (propId: string) => {
    setSelectedProposalToAccept(propId);
    setEscrowModalOpen(true);
  };

  const handleConfirmEscrowPayment = (paymentMethod: string) => {
    if (selectedProposalToAccept) {
      acceptProposal(selectedProposalToAccept, paymentMethod);
      setEscrowModalOpen(false);
      navigate('/dashboard');
    }
  };

  const targetProposal = jobProposals.find((p) => p.id === selectedProposalToAccept);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
        {/* Breadcrumb */}
        <div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Browse Jobs</span>
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Job Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {job.category}
                </span>
                <span className="text-xs text-slate-400">
                  Posted {formatDate(job.createdAt)}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  job.status === 'open'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}>
                  Status: {job.status.replace('_', ' ')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Budget (Escrow)</span>
                  <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatBDT(job.budget)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Deadline</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    {formatDate(job.deadline)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Proposals</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {jobProposals.length} Submitted
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Project Description
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Required Skills */}
              <div>
                <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Required Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action row */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                {userExistingProposal ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>You submitted a proposal for {formatBDT(userExistingProposal.bidAmount)} ({userExistingProposal.status})</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        navigate('/login');
                      } else {
                        setProposalModalOpen(true);
                      }
                    }}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Apply for this Job</span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Client payment verified in BDT</span>
                </div>
              </div>
            </div>

            {/* AI Skill Matcher Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white border border-indigo-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-tight text-white">AI Skill Matcher</h3>
                    <p className="text-xs text-indigo-300">Gemini model recommended candidates based on skills and ratings</p>
                  </div>
                </div>
                {loadingAi && (
                  <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiMatches.map((match) => (
                  <div
                    key={match.freelancerId}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {match.matchScore}% Match
                        </span>
                        <RatingStars rating={4.9} size="sm" showNumber={false} />
                      </div>
                      <h4 className="font-bold text-sm text-white">{match.name}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                        {match.reasoning}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                      <Link
                        to={`/profile/${match.freelancerId}`}
                        className="text-indigo-300 hover:text-white font-bold transition-colors"
                      >
                        View Profile &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitted Proposals Section (visible to Job Owner / Client) */}
            {(isJobOwner || currentUser?.role === 'admin') && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Received Proposals ({jobProposals.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Review and hire with escrow protection
                  </span>
                </div>

                {jobProposals.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No proposals submitted yet. Freelancers will appear here as they apply.
                  </div>
                ) : (
                  jobProposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prop.freelancerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                            alt={prop.freelancerName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <Link
                              to={`/profile/${prop.freelancerId}`}
                              className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600"
                            >
                              {prop.freelancerName}
                            </Link>
                            <div className="text-[11px] text-slate-500">{prop.freelancerHeadline}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Bid Amount</span>
                            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatBDT(prop.bidAmount)}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">&bull;</span>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Timeline</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {prop.deliveryDays} Days
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        {prop.coverLetter}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const convId = createOrGetConversation(
                              prop.freelancerId,
                              prop.freelancerName,
                              prop.freelancerAvatar
                            );
                            navigate(`/chat?conv=${convId}`);
                          }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message {prop.freelancerName}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          {prop.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => rejectProposal(prop.id)}
                                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStartAcceptProposal(prop.id)}
                                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20"
                              >
                                Accept & Pay Escrow
                              </button>
                            </>
                          ) : (
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                              prop.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {prop.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Column: Client Summary & Escrow Protection */}
          <div className="md:col-span-1 space-y-6">
            {/* Client Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                About the Client
              </h3>

              <div className="flex items-center gap-3">
                <img
                  src={job.clientAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'}
                  alt={job.clientName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {job.clientName}
                  </h4>
                  <span className="text-xs text-slate-500">Member since 2026</span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Payment Method:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">Verified</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <strong className="text-slate-800 dark:text-slate-200">Dhaka, Bangladesh</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Open Jobs:</span>
                  <strong className="text-slate-800 dark:text-slate-200">2 Jobs Active</strong>
                </div>
              </div>
            </div>

            {/* Escrow Trust Box */}
            <div className="p-6 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>100% Escrow Protection</span>
              </div>
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                When a client accepts a proposal, funds are deposited into SkillShare Escrow. Freelancers can work with confidence knowing payment is guaranteed upon satisfactory completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      {proposalModalOpen && (
        <AIProposalModal
          isOpen={proposalModalOpen}
          onClose={() => setProposalModalOpen(false)}
          job={job}
        />
      )}

      {/* Escrow Modal */}
      {escrowModalOpen && targetProposal && (
        <EscrowPaymentModal
          isOpen={escrowModalOpen}
          onClose={() => setEscrowModalOpen(false)}
          title={job.title}
          amount={targetProposal.bidAmount}
          freelancerName={targetProposal.freelancerName}
          onConfirmPayment={handleConfirmEscrowPayment}
        />
      )}
    </div>
  );
};
