
import { useState } from 'react';
import { User } from '@/types';

/**
 * Main hook for managing authentication and user state
 * This combines session management and profile state
 */
export const useAuthState = () => {
  // Basic state management
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<any>(null);

  return { user, session, isLoading, setUser, setIsLoading, setSession };
};

export default useAuthState;
