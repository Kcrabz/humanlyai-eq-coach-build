
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

export function UserAvatar() {
  const { user } = useAuth();
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "You";
    
    const nameParts = user.name.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-humanly-teal text-white">
        {getUserInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
