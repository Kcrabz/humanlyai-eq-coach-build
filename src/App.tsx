
import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext";
import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PricingPage from "./pages/PricingPage";
import AccountPage from "./pages/AccountPage";
import ChatPage from "./pages/ChatPage";
import { PageLayout } from "./components/layout/PageLayout";
import { Toaster } from "./components/ui/sonner";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
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

// Add a redirect from dashboard to chat
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
        element: <ChatPage />, // Redirect dashboard to chat page
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
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}

export default App;
