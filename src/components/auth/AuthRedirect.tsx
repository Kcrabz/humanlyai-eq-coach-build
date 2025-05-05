
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

export function AuthRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      console.log("AuthRedirect: User already authenticated, redirecting");
      if (!user.onboarded) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/chat", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Loading size="large" />
      </div>
    );
  }

  return null;
}
