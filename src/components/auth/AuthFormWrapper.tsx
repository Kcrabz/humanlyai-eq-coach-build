
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

interface AuthFormWrapperProps {
  children: React.ReactNode;
}

export function AuthFormWrapper({ children }: AuthFormWrapperProps) {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="w-full max-w-md flex justify-center items-center p-8">
        <Loading size="large" />
      </div>
    );
  }
  
  return <>{children}</>;
}
