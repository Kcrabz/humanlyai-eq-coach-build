
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface KaiAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KaiAvatar({ size = "md", className = "" }: KaiAvatarProps) {
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src="/images/kai-avatar.png" alt="Kai" />
      <AvatarFallback className="bg-humanly-green text-white">
        K
      </AvatarFallback>
    </Avatar>
  );
}
