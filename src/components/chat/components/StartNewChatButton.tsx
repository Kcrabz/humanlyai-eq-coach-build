
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useChat } from "@/context/ChatContext";

export function StartNewChatButton() {
  const { startNewChat, isLoading } = useChat();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={startNewChat}
      disabled={isLoading}
      className="gap-2 bg-humanly-pastel-lavender/20 text-humanly-indigo border-humanly-pastel-lavender/30 hover:bg-humanly-pastel-lavender/40 hover:text-humanly-indigo-dark hover:border-humanly-pastel-lavender/50 transition-all duration-300"
    >
      <RefreshCw className="h-4 w-4" />
      <span>New Chat</span>
    </Button>
  );
}
