import React, { useState } from 'react';
import { X, Star, Check } from 'lucide-react';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { RatingStars } from './RatingStars';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  role: 'client' | 'freelancer';
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, order, role }) => {
  const { currentUser } = useAuth();
  const { addReview } = useData();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const revieweeId = role === 'client' ? order.freelancerId : order.clientId;
  const revieweeName = role === 'client' ? order.freelancerName : order.clientName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    addReview({
      orderId: order.id,
      reviewerId: currentUser.uid,
      reviewerName: currentUser.displayName,
      reviewerAvatar: currentUser.photoURL,
      revieweeId,
      revieweeName,
      rating,
      comment,
      role,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-amber-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Rate & Review</h3>
            <p className="text-xs text-slate-500">Share your feedback for {revieweeName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="font-bold text-xl text-slate-900 dark:text-white">Review Submitted!</h4>
            <p className="text-xs text-slate-500">Thank you for helping build trust in our community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-center py-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Your Rating
              </label>
              <div className="flex justify-center">
                <RatingStars rating={rating} size="lg" interactive onRate={(r) => setRating(r)} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Detailed Feedback
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Describe your collaboration with ${revieweeName}, communication quality, timeliness, and outcome...`}
                className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Publish Review</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
