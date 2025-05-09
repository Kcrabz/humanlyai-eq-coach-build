
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function AssistantAvatar() {
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage src="/images/kai-avatar.png" alt="Kai" />
      <AvatarFallback className="bg-humanly-green text-white">
        K
      </AvatarFallback>
    </Avatar>
  );
}
