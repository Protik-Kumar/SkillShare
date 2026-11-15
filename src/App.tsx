import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeLanguageProvider } from './context/ThemeLanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { BrowseFreelancersPage } from './pages/BrowseFreelancersPage';
import { BrowseJobsPage } from './pages/BrowseJobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { FreelancerProfilePage } from './pages/FreelancerProfilePage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { PostJobPage } from './pages/PostJobPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Bell, X } from 'lucide-react';

const AnnouncementBanner: React.FC = () => {
  const { settings } = useData();
  const [dismissed, setDismissed] = React.useState(false);

  if (!settings.announcement || dismissed) return null;

  return (
    <aside aria-label="Platform Announcement" className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-emerald-600 text-white text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 text-center flex items-center justify-between shadow-sm relative z-50 overflow-hidden w-full">
      <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 min-w-0">
        <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce shrink-0" />
        <span className="font-semibold line-clamp-1 sm:line-clamp-none break-words">{settings.announcement}</span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-white/80 hover:text-white p-1 ml-1 sm:ml-2 cursor-pointer shrink-0"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </aside>
  );
};

export default function App() {
  return (
    <ThemeLanguageProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white overflow-x-hidden max-w-full w-full">
              <AnnouncementBanner />
              <Navbar />

              <main className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/freelancers" element={<BrowseFreelancersPage />} />
                  <Route path="/jobs" element={<BrowseJobsPage />} />
                  <Route path="/jobs/:id" element={<JobDetailPage />} />
                  <Route path="/profile/:id" element={<FreelancerProfilePage />} />
                  <Route path="/services/:id" element={<ServiceDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected routes */}
                  <Route
                    path="/jobs/new"
                    element={
                      <ProtectedRoute>
                        <PostJobPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Only Route */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminPanelPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeLanguageProvider>
  );
}
