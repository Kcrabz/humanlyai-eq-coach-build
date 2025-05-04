
import { User } from "@/types";
import { useAuthCore } from "@/hooks/useAuthCore";
import { useAuthSignup } from "@/hooks/useAuthSignup";

export const useAuthActions = (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  const { login, logout, updateProfile } = useAuthCore(setUser);
  const { signup } = useAuthSignup(setUser);

  return {
    login,
    signup,
    logout,
    updateProfile
  };
};
