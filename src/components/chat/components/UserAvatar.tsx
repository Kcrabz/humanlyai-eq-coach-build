
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { generateAvatarUrl } from "@/lib/avatar-options";

interface UserAvatarProps {
  userId?: string;
  name?: string;
  avatarUrl?: string;
  className?: string;
}

export function UserAvatar({ userId, name, avatarUrl, className }: UserAvatarProps) {
  const { user: authUser } = useAuth();
  
  // If no props are provided, use data from auth context
  const effectiveUserId = userId || authUser?.id;
  const effectiveName = name || authUser?.name || 'User';
  const effectiveAvatarUrl = avatarUrl || authUser?.avatar_url;
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const username = effectiveName;
    if (!username) return "U";
    
    const nameParts = username.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  return (
    <Avatar className={className || "h-8 w-8"}>
      {effectiveAvatarUrl && (
        <AvatarImage 
          src={effectiveAvatarUrl.includes('://') 
            ? effectiveAvatarUrl 
            : generateAvatarUrl(effectiveAvatarUrl)
          } 
          alt={effectiveName} 
        />
      )}
      <AvatarFallback className="bg-humanly-teal text-white">
        {getUserInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
