import React, { useState } from 'react';
import { X, Smartphone, Building, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { formatBDT } from '../utils/formatters';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
}) => {
  const { currentUser } = useAuth();
  const { requestWithdrawal } = useData();

  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Bank'>('bKash');
  const [amount, setAmount] = useState<number>(Math.min(5000, availableBalance));
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(currentUser?.displayName || '');
  const [bankName, setBankName] = useState('BRAC Bank PLC');
  const [branch, setBranch] = useState('Gulshan Branch');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (amount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    if (amount > availableBalance) {
      setError(`Cannot withdraw more than available balance (${formatBDT(availableBalance)}).`);
      return;
    }

    requestWithdrawal({
      userId: currentUser.uid,
      userName: currentUser.displayName,
      method,
      accountNumber,
      accountName,
      bankName: method === 'Bank' ? bankName : undefined,
      branch: method === 'Bank' ? branch : undefined,
      amount,
      fee: 0, // 0% withdrawal fee promo
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
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Withdraw Funds</h3>
            <p className="text-xs text-slate-500">Available Balance: <strong className="text-emerald-600 dark:text-emerald-400">{formatBDT(availableBalance)}</strong></p>
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
            <h4 className="font-bold text-xl text-slate-900 dark:text-white">Withdrawal Request Placed!</h4>
            <p className="text-xs text-slate-500">
              Your request for {formatBDT(amount)} via {method} is submitted and will be reviewed by admin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Method selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Payout Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bKash', name: 'bKash', icon: Smartphone, color: 'text-pink-600 border-pink-400 bg-pink-50 dark:bg-pink-950/30' },
                  { id: 'Nagad', name: 'Nagad', icon: Smartphone, color: 'text-orange-600 border-orange-400 bg-orange-50 dark:bg-orange-950/30' },
                  { id: 'Bank', name: 'Bank PLC', icon: Building, color: 'text-indigo-600 border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMethod(item.id as any);
                      setError('');
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 text-xs font-bold ${
                      method === item.id
                        ? `${item.color} ring-2 ring-emerald-500 shadow-sm`
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Amount to Withdraw (৳ BDT)
              </label>
              <input
                type="number"
                required
                min={500}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Account number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {method === 'Bank' ? 'Bank Account Number' : `${method} Mobile Number`}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={method === 'Bank' ? '101XXXXXXXXX' : '01XXXXXXXXX'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {method === 'Bank' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-[11px] text-slate-500 flex justify-between">
              <span>Withdrawal Fee:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">৳0 (Free Promo)</strong>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Request Withdrawal of {formatBDT(amount)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
