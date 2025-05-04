
import { useAuthSession } from '@/hooks/useAuthSession';
import { useProfileState } from '@/hooks/useProfileState';

/**
 * Main hook for managing authentication and user state
 * This combines session management and profile state
 */
export const useAuthState = () => {
  // Handle authentication session
  const { session, isLoading, setIsLoading } = useAuthSession();
  
  // Handle user profile state
  const { user, setUser } = useProfileState(session, isLoading, setIsLoading);

  return { user, session, isLoading, setUser };
};
