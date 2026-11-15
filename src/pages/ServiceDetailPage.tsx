import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  Check,
  ArrowLeft,
  DollarSign,
  MessageSquare,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatBDT } from '../utils/formatters';
import { RatingStars } from '../components/RatingStars';
import { EscrowPaymentModal } from '../components/EscrowPaymentModal';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { services, createOrGetConversation } = useData();
  const { currentUser } = useAuth();

  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const service = services.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service not found</h2>
        <Link to="/freelancers" className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          &larr; Browse Services
        </Link>
      </div>
    );
  }

  const handleStartChat = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const convId = createOrGetConversation(service.freelancerId, service.freelancerName);
    navigate(`/chat?conv=${convId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link
            to="/freelancers"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Browse</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left: Images & Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                  {service.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2 leading-snug">
                  {service.title}
                </h1>
              </div>

              {/* Sample Images Gallery */}
              <div className="space-y-3">
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <img
                    src={service.sampleImages[activeImageIndex] || service.sampleImages[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {service.sampleImages.length > 1 && (
                  <div className="flex gap-2">
                    {service.sampleImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                          activeImageIndex === idx ? 'border-indigo-600' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Description */}
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  What's Included in This Service
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              {/* Guarantee list */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>100% Satisfaction & Revision Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Delivery in {service.deliveryTimeDays} Business Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Escrow protection via bKash, Nagad, or Bank</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Checkout Box */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 sticky top-24">
              <div className="flex justify-between items-baseline pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Service Price</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatBDT(service.price)}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" /> Delivery Time:
                  </span>
                  <strong className="text-slate-900 dark:text-white">{service.deliveryTimeDays} Days</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Escrow Status:
                  </span>
                  <strong className="text-emerald-600 dark:text-emerald-400">Guaranteed</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    navigate('/login');
                  } else {
                    setEscrowModalOpen(true);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Escrow ({formatBDT(service.price)})</span>
              </button>

              <button
                type="button"
                onClick={handleStartChat}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                <span>Contact {service.freelancerName}</span>
              </button>

              {/* Freelancer snippet */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <img
                  src={service.freelancerAvatar}
                  alt={service.freelancerName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <Link
                    to={`/profile/${service.freelancerId}`}
                    className="font-bold text-sm text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                  >
                    {service.freelancerName}
                  </Link>
                  <RatingStars rating={service.freelancerRating || 5.0} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Checkout Modal */}
      {escrowModalOpen && (
        <EscrowPaymentModal
          isOpen={escrowModalOpen}
          onClose={() => setEscrowModalOpen(false)}
          title={service.title}
          amount={service.price}
          freelancerName={service.freelancerName}
          onConfirmPayment={() => {
            setEscrowModalOpen(false);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};
