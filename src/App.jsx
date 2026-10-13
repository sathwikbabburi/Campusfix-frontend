import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AIChatbotWidget from './components/chat/AIChatbotWidget';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintsListPage from './pages/ComplaintsListPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import NewComplaintPage from './pages/NewComplaintPage';
import TrackTicketPage from './pages/TrackTicketPage';
import AnnouncementsPage from './pages/AnnouncementsPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans antialiased selection:bg-blue-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/complaints" element={<ComplaintsListPage />} />
                <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="/track" element={<TrackTicketPage />} />
                <Route path="/announcements" element={<AnnouncementsPage />} />

                {/* Protected Routes (Week 5 & 6) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/new-complaint"
                  element={
                    <ProtectedRoute>
                      <NewComplaintPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />

            {/* Global AI Assistant Floating Widget (Week 7-8) */}
            <AIChatbotWidget />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
