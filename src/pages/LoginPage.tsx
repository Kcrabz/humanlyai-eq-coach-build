
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Add direct navigation effect at page level
  useEffect(() => {
    if (!isLoading) {
      console.log("LoginPage auth check:", {
        isAuthenticated,
        userExists: !!user,
        isOnboarded: user?.onboarded,
        currentPath: window.location.pathname
      });
      
      if (isAuthenticated) {
        if (user?.onboarded === true) {
          console.log("User is authenticated and onboarded, navigating to chat from LoginPage");
          navigate("/chat", { replace: true });
        } else if (user?.onboarded === false) {
          console.log("User is authenticated but not onboarded, navigating to onboarding from LoginPage");
          navigate("/onboarding", { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return (
    <PageLayout>
      <div className="flex items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10">
          {/* Light effect behind the form */}
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-mint/40 rounded-3xl blur-xl"></div>
          <AuthForm type="login" />
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
