
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/context/AuthContext";

interface AuthFormWrapperProps {
  children: React.ReactNode;
}

export function AuthFormWrapper({ children }: AuthFormWrapperProps) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Add effect to handle authenticated state changes
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log("AuthFormWrapper detected authenticated user:", { 
        isOnboarded: user?.onboarded,
        currentPath: window.location.pathname
      });
      
      if (user?.onboarded === true) {
        console.log("AuthFormWrapper redirecting to chat");
        navigate("/chat", { replace: true });
      } else if (user?.onboarded === false) {
        console.log("AuthFormWrapper redirecting to onboarding");
        navigate("/onboarding", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLoading]);
  
  // If the authentication is loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="w-full max-w-md flex justify-center items-center p-8">
        <Loading size="large" className="border-humanly-teal border-t-transparent" />
      </div>
    );
  }
  
  return <>{children}</>;
}
