
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const LoginPage = () => {
  const { isLoading, user, authEvent } = useAuth();
  const navigate = useNavigate();
  
  // Handle direct redirection from the login page if user is already authenticated
  useEffect(() => {
    if (isLoading) {
      console.log("LoginPage: Auth state still loading");
      return;
    }
    
    console.log("LoginPage: Auth state check", { 
      hasUser: !!user, 
      userOnboarded: user?.onboarded, 
      authEvent,
      timestamp: new Date().toISOString()
    });
    
    // If user is authenticated, redirect appropriately
    if (user) {
      console.log("LoginPage: User is already authenticated, redirecting");
      
      if (!user.onboarded) {
        console.log("LoginPage: Redirecting to onboarding");
        navigate("/onboarding", { replace: true });
        toast.success("Welcome! Please complete onboarding to continue.");
      } else {
        console.log("LoginPage: Redirecting to dashboard");
        navigate("/dashboard", { replace: true });
        toast.success(`Welcome back, ${user.name || 'Friend'}!`);
      }
    }
  }, [user, isLoading, navigate, authEvent]);
  
  return (
    <PageLayout>
      <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10">
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-mint/40 rounded-3xl blur-xl"></div>
          <AuthForm type="login" />
        </div>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
