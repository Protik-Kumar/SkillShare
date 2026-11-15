import React, { useState } from 'react';
import { X, Upload, Link2, Check, FileText } from 'lucide-react';
import { Order } from '../types';
import { useData } from '../context/DataContext';

interface DeliverWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const DeliverWorkModal: React.FC<DeliverWorkModalProps> = ({ isOpen, onClose, order }) => {
  const { deliverOrder } = useData();
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    deliverOrder(order.id, deliveryNotes, fileUrl ? [fileUrl] : []);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Deliver Completed Work</h3>
            <p className="text-xs text-slate-500">{order.orderNumber} &bull; {order.title}</p>
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
            <h4 className="font-bold text-xl text-slate-900 dark:text-white">Delivery Sent!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              The client has been notified to review your deliverables and release escrow funds.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                Delivery Notes & Summary
              </label>
              <textarea
                required
                rows={4}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Explain what was accomplished, where to access files, installation details, or how to review..."
                className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                Deliverable Link (GitHub, Figma, Google Drive, or Zip)
              </label>
              <input
                type="url"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/... or https://github.com/..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Delivery to Client</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
