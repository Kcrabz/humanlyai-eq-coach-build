
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";

const SignupPage = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center py-12 animate-scale-fade-in">
        <div className="relative z-10">
          {/* Light effect behind the form */}
          <div className="absolute -z-10 w-full h-full top-0 left-0 transform -translate-x-4 -translate-y-4 bg-humanly-pastel-lavender/40 rounded-3xl blur-xl"></div>
          <AuthForm type="signup" />
        </div>
      </div>
    </PageLayout>
  );
};

export default SignupPage;
