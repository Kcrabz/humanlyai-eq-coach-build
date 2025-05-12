
import React from "react";
import { Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { NotFound } from "./pages/NotFound";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PricingPage } from "./pages/PricingPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { UpdatePasswordPage } from "./pages/UpdatePasswordPage";
import { UserProgressPage } from "./pages/UserProgressPage";
import { AdminPage } from "./pages/AdminPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/progress" element={<UserProgressPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
