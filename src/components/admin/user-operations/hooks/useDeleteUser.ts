
import { useState } from "react";

export const useDeleteUser = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen
  };
};
