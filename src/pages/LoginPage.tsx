
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { PageLayout } from "@/components/layout/PageLayout";

const LoginPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
      <div className="relative z-10">
        <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-mint/40 rounded-3xl blur-xl"></div>
        <AuthForm type="login" />
      </div>
    </div>
  );
};

export default LoginPage;
