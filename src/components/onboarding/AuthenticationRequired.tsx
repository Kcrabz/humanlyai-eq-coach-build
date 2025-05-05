
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const AuthenticationRequired = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    toast.error("You need to be logged in to access this page");
    const timer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <h2 className="text-2xl font-bold">Authentication Required</h2>
      <p className="text-muted-foreground">Please log in to access the onboarding process.</p>
      <Button onClick={() => navigate("/login", { replace: true })}>
        Go to Login
      </Button>
    </div>
  );
};
