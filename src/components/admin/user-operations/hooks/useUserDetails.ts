
import { useState } from "react";
import { SubscriptionTier, EQArchetype, User } from "@/types";
import { UserTableData } from "@/hooks/useUserManagement/types";

export const useUserDetails = (user: UserTableData) => {
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Correctly type eq_archetype by validating it against valid EQArchetype values
  const getValidEQArchetype = (archetype: string | undefined): EQArchetype | "Not set" => {
    const validArchetypes: EQArchetype[] = ["reflector", "activator", "regulator", "connector", "observer"];
    if (!archetype) return "Not set";
    return validArchetypes.includes(archetype as EQArchetype) ? archetype as EQArchetype : "Not set";
  };

  // Create a version of the user that conforms to the User type requirements
  const userForDialogs: User = {
    ...user,
    // Properly cast eq_archetype to the expected union type
    eq_archetype: getValidEQArchetype(user.eq_archetype),
    // Add any other required fields that might be missing
    subscription_tier: (user.subscription_tier || "free") as SubscriptionTier,
    onboarded: user.onboarded || false
  };

  return {
    showUserDetails,
    setShowUserDetails,
    userForDialogs
  };
};
