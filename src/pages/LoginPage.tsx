
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to chat");
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  return (
    <PageLayout>
      <div className="flex items-center justify-center py-12">
        <AuthForm type="login" />
      </div>
    </PageLayout>
  );
};

export default LoginPage;
