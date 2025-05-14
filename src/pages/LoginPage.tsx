
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { PageLayout } from "@/components/layout/PageLayout";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { wasLoginSuccessful } from "@/utils/loginRedirectUtils";

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Handle direct dashboard redirection for authenticated users
  useEffect(() => {
    // Only run this effect if we have user data and aren't loading
    if (!isLoading && user) {
      console.log("LoginPage: User already authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
    
    // Extra check for login success
    if (wasLoginSuccessful()) {
      console.log("LoginPage: Login success detected, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);
  
  return (
    <PageLayout>
      <AuthRedirect />
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
