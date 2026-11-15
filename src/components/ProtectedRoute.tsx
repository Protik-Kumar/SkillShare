import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Checking credentials...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl max-w-md w-full text-center border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Access Restricted (Admin Only)
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Admin Panel is reserved exclusively for authorized platform administrators. You are currently logged in as a normal user.
          </p>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-[11px] text-slate-600 dark:text-slate-300">
            To test Admin features, log in as <br />
            <strong className="text-indigo-600 dark:text-indigo-400">admin@skillshare.com</strong> / <strong>Admin@123</strong> or use the top "Demo Accounts" button.
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
