
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";

const SignupPage = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center py-12">
        <AuthForm type="signup" />
      </div>
    </PageLayout>
  );
};

export default SignupPage;
