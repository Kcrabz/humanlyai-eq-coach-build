
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PricingPage from "./pages/PricingPage";
import AccountPage from "./pages/AccountPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import { PageLayout } from "./components/layout/PageLayout";
import { Toaster } from "./components/ui/sonner";
import { AuthenticationGuard } from "./components/auth/AuthenticationGuard";
import { Header } from "./components/layout/Header";
import { AdminRoute } from "./components/admin/AdminRoute";

// Home page that redirects to chat
const Index = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate("/chat");
  }, [navigate]);

  return null;
};

// Root layout component that includes AuthProvider
const RootLayout = () => {
  return (
    <AuthProvider>
      <AuthenticationGuard />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <Outlet />
      </div>
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
};

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <PageLayout><Index /></PageLayout>
      },
      {
        path: "/login",
        element: <PageLayout fullWidth><LoginPage /></PageLayout>
      },
      {
        path: "/signup",
        element: <PageLayout fullWidth><SignupPage /></PageLayout>
      },
      {
        path: "/dashboard",
        element: <PageLayout><DashboardPage /></PageLayout>,
      },
      {
        path: "/chat",
        element: <PageLayout><ChatPage /></PageLayout>
      },
      {
        path: "/onboarding",
        element: <PageLayout fullWidth><OnboardingPage /></PageLayout>
      },
      {
        path: "/pricing",
        element: <PageLayout><PricingPage /></PageLayout>
      },
      {
        path: "/account",
        element: <PageLayout><AccountPage /></PageLayout>
      },
      {
        path: "/admin",
        element: <PageLayout><AdminRoute><AdminPage /></AdminRoute></PageLayout>
      },
      {
        path: "*",
        element: <PageLayout><NotFound /></PageLayout>
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
