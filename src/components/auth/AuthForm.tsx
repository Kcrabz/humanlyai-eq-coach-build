
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { AuthFormWrapper } from "./AuthFormWrapper";

interface AuthFormProps {
  type: "login" | "signup";
}

export function AuthForm({ type }: AuthFormProps) {
  const { isAuthenticated, user } = useAuth();
  
  console.log("Auth form rendered:", { 
    type, 
    isAuthenticated, 
    userStatus: user ? `User exists (onboarded: ${user.onboarded})` : "No user" 
  });
  
  return (
    <AuthFormWrapper>
      {type === "login" ? <LoginForm /> : <SignupForm />}
    </AuthFormWrapper>
  );
}
