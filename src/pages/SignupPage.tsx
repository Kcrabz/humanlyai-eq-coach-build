
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthRedirect } from "@/components/auth/AuthRedirect";
import { PageLayout } from "@/components/layout/PageLayout";
import { ReCaptchaProvider } from "@/components/auth/ReCaptchaProvider";

const SignupPage = () => {
  return (
    <PageLayout>
      <AuthRedirect />
      <div className="flex min-h-screen items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10">
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-lavender/40 rounded-3xl blur-xl"></div>
          <ReCaptchaProvider>
            <AuthForm type="signup" />
          </ReCaptchaProvider>
        </div>
      </div>
    </PageLayout>
  );
};

export default SignupPage;
