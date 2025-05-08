
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
import { PageLayout } from "./components/layout/PageLayout";
import { Toaster } from "./components/ui/sonner";
import { AuthenticationGuard } from "./components/auth/AuthenticationGuard";

// Home page that redirects to chat
const Index = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate("/chat");
  }, [navigate]);

  return null;
};

const Root = () => {
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
};

// Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/",
        element: <Index />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/signup",
        element: <SignupPage />
      },
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/chat",
        element: <ChatPage />
      },
      {
        path: "/onboarding",
        element: <OnboardingPage />
      },
      {
        path: "/pricing",
        element: <PricingPage />
      },
      {
        path: "/account",
        element: <AccountPage />
      },
    ]
  }
]);

function App() {
  return (
    // First render the RouterProvider, then the AuthProvider
    <RouterProvider router={router}>
      <AuthProvider>
        <AuthenticationGuard />
        <Toaster position="bottom-right" />
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
