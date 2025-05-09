
import { useState } from "react";
import { SubscriptionTier } from "@/types";

export const useSubscriptionUpdate = (
  onUpdateTier: (userId: string, tier: SubscriptionTier) => Promise<void>,
  userId: string,
  currentTier?: string
) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateTier = async (tier: SubscriptionTier) => {
    if (!currentTier || tier === currentTier as SubscriptionTier) return;
    
    setIsUpdating(true);
    try {
      await onUpdateTier(userId, tier);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    handleUpdateTier
  };
};
