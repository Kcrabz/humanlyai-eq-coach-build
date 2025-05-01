
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";

const LoginPage = () => {
  return (
    <PageLayout>
      <div className="flex items-center justify-center py-12">
        <AuthForm type="login" />
      </div>
    </PageLayout>
  );
};

export default LoginPage;
