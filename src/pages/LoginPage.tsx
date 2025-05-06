
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const { isLoading } = useAuth();
  
  // We don't need explicit redirection in this component anymore
  // The AuthenticationGuard will handle all redirects
  
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
