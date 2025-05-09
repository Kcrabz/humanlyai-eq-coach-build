
import { useState } from "react";

export const useResetPassword = () => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  return {
    isResetDialogOpen,
    setIsResetDialogOpen
  };
};
