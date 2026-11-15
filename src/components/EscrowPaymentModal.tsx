import React, { useState } from 'react';
import { X, ShieldCheck, Check, Smartphone, Building, CreditCard, Lock } from 'lucide-react';
import { formatBDT } from '../utils/formatters';

interface EscrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  amount: number;
  freelancerName: string;
  onConfirmPayment: (paymentMethod: string) => void;
}

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({
  isOpen,
  onClose,
  title,
  amount,
  freelancerName,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Card'>('bKash');
  const [accountNumber, setAccountNumber] = useState('017XXXXXXXX');
  const [pin, setPin] = useState('••••');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirmPayment(`${method} Escrow`);
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Secure Escrow Checkout</h3>
              <p className="text-xs text-slate-500">Funds are protected until you approve delivery</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h4 className="font-extrabold text-xl text-slate-900 dark:text-white">Escrow Payment Locked!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {formatBDT(amount)} has been deposited into secure escrow. The order is now active!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Order summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="text-slate-500 font-medium">Order: <span className="text-slate-800 dark:text-slate-200 font-semibold">{title}</span></div>
              <div className="text-slate-500 font-medium">Freelancer: <span className="text-slate-800 dark:text-slate-200 font-semibold">{freelancerName}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-600 font-bold text-sm">
                <span className="text-slate-700 dark:text-slate-300">Total Escrow Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base">{formatBDT(amount)}</span>
              </div>
            </div>

            {/* Payment method selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Bangladeshi Payment Method
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'bKash', name: 'bKash', icon: Smartphone, color: 'text-pink-600 border-pink-400 bg-pink-50 dark:bg-pink-950/30' },
                  { id: 'Nagad', name: 'Nagad', icon: Smartphone, color: 'text-orange-600 border-orange-400 bg-orange-50 dark:bg-orange-950/30' },
                  { id: 'Rocket', name: 'Rocket', icon: Building, color: 'text-purple-600 border-purple-400 bg-purple-50 dark:bg-purple-950/30' },
                  { id: 'Card', name: 'Bank Card', icon: CreditCard, color: 'text-indigo-600 border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 text-xs font-bold ${
                      method === item.id
                        ? `${item.color} ring-2 ring-indigo-500 shadow-sm`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated credential fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {method === 'Card' ? 'Card Number' : `${method} Wallet Number`}
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={method === 'Card' ? '4111 2222 3333 4444' : '01XXXXXXXXX'}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {method === 'Card' ? 'CVV' : `${method} PIN (Simulated)`}
                </label>
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated Payment Gateway. No actual debit occurs.</span>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Escrow with {method}...</span>
                </>
              ) : (
                <span>Pay & Lock {formatBDT(amount)} in Escrow</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
