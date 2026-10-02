import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { SnowBackground } from "./components/SnowBackground";

import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { ArcSetupPage } from "./pages/ArcSetupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RoutinePage } from "./pages/RoutinePage";
import { TaskLibraryPage } from "./pages/TaskLibraryPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { WalletPage } from "./pages/WalletPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="py-20 text-center text-slate-400">Loading FrostMode...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<ProtectedRoute><ArcSetupPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/routine" element={<ProtectedRoute><RoutinePage /></ProtectedRoute>} />
          <Route path="/library" element={<TaskLibraryPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

import { GoogleOAuthProvider } from "@react-oauth/google";

import { CustomCursor } from "./components/CustomCursor";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1061825611076-r9st2ddp2vcv29alm9m1m5r83h9ejdg6.apps.googleusercontent.com";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <CustomCursor />
            <SnowBackground />
            <AppRoutes />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
