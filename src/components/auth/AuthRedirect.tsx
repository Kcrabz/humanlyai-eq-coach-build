
import { useAuth } from "@/context/AuthContext";
import { Loading } from "@/components/ui/loading";

export function AuthRedirect() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <Loading size="large" />
      </div>
    );
  }

  // Simply render nothing - all redirects now handled by AuthenticationGuard
  return null;
}
