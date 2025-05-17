
import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import OnboardingPage from "./pages/OnboardingPage";
import SettingsPage from "./pages/SettingsPage";
import DashboardPage from "./pages/DashboardPage";
import PricingPage from "./pages/PricingPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import UserProgressPage from "./pages/UserProgressPage";
import AdminPage from "./pages/AdminPage";

// Define route groups
const publicRoutes = [
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/update-password", element: <UpdatePasswordPage /> },
  { path: "/pricing", element: <PricingPage /> }
];

const protectedRoutes = [
  { path: "/chat", element: <ChatPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/progress", element: <UserProgressPage /> },
  { path: "/admin", element: <AdminPage /> }
];

const AppRoutes = () => {
  return (
    <Routes>
      {/* Map over public routes */}
      {publicRoutes.map(route => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute>{<Outlet />}</ProtectedRoute>}>
        {protectedRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
