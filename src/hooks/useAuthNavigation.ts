
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";

export const useAuthNavigation = (user: User | null, isLoading: boolean) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && user) {
      if (!user.onboarded) {
        navigate("/onboarding");
      } else if (window.location.pathname === "/login" || window.location.pathname === "/signup") {
        navigate("/chat");
      }
    }
  }, [user, isLoading, navigate]);

  return navigate;
};
