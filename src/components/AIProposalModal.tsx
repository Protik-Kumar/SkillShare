import React, { useState } from 'react';
import { X, Sparkles, Send, Clock, DollarSign, Check } from 'lucide-react';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { generateAIProposal } from '../lib/gemini';
import { formatBDT } from '../utils/formatters';

interface AIProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

export const AIProposalModal: React.FC<AIProposalModalProps> = ({ isOpen, onClose, job }) => {
  const { currentUser, currentProfile } = useAuth();
  const { submitProposal } = useData();

  const [bidAmount, setBidAmount] = useState<number>(job.budget);
  const [deliveryDays, setDeliveryDays] = useState<number>(7);
  const [coverLetter, setCoverLetter] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    if (!currentProfile) return;
    setIsAiGenerating(true);
    try {
      const draft = await generateAIProposal(
        job.title,
        job.description,
        currentProfile,
        bidAmount,
        deliveryDays
      );
      setCoverLetter(draft);
    } catch (err) {
      console.warn('AI proposal generation error:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentProfile) return;

    submitProposal({
      jobId: job.id,
      jobTitle: job.title,
      jobClientId: job.clientId,
      freelancerId: currentUser.uid,
      freelancerName: currentUser.displayName,
      freelancerAvatar: currentUser.photoURL,
      freelancerHeadline: currentProfile.headline,
      freelancerRating: currentProfile.rating,
      bidAmount,
      deliveryDays,
      coverLetter,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Submit Job Proposal</h3>
            <p className="text-xs text-slate-500 truncate max-w-md">{job.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="font-bold text-xl text-slate-900 dark:text-white">Proposal Submitted!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              The client has been notified. You can track this proposal in your Freelancer Dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Bid and delivery row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  Your Bid (৳ BDT)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={500}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">
                    Client budget: {formatBDT(job.budget)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Delivery Time (Days)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Cover letter with AI button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Cover Letter & Pitch
                </label>
                <button
                  type="button"
                  disabled={isAiGenerating || !currentProfile}
                  onClick={handleGenerateAI}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-sm disabled:opacity-50 transition-all cursor-pointer"
                  title="Generate a winning personalized proposal with Gemini AI"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAiGenerating ? 'Drafting with AI...' : 'Draft with AI'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself, explain how you will accomplish this project, and describe your relevant experience..."
                className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-[11px] text-slate-500 leading-normal">
              💡 <strong>Pro Tip:</strong> Tailor your pitch to the client's problem. You can click <strong>"Draft with AI"</strong> to automatically generate a tailored proposal based on your profile skills and the job description.
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Proposal ({formatBDT(bidAmount)})</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
