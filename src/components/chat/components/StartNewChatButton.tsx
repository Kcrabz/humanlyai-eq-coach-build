
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
      className="gap-2 text-muted-foreground hover:bg-humanly-pastel-lavender/20 hover:text-humanly-indigo"
    >
      <RefreshCw className="h-4 w-4" />
      <span>New Chat</span>
    </Button>
  );
}
