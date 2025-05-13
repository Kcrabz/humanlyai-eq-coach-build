
import React from "react";
import { Sparkles, Brain, MessageSquare } from "lucide-react";

interface MemoryTypeIconProps {
  type: string;
}

export const MemoryTypeIcon = ({ type }: MemoryTypeIconProps) => {
  switch (type) {
    case 'insight':
    case 'breakthrough':
      return <Sparkles className="h-4 w-4 text-humanly-indigo" />;
    case 'topic':
      return <Brain className="h-4 w-4 text-humanly-teal" />;
    default:
      return <MessageSquare className="h-4 w-4 text-slate-500" />;
  }
};
