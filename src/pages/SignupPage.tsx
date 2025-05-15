
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Direct users to onboarding if they're authenticated but not onboarded
  useEffect(() => {
    if (!isLoading && user) {
      if (!user.onboarded) {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);
  
  return (
    <PageLayout>
      <AuthRedirect />
      <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10">
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-lavender/40 rounded-3xl blur-xl"></div>
          <AuthForm type="signup" />
        </div>
      </div>
    </PageLayout>
  );
};

export default SignupPage;
