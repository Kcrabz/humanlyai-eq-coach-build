
import { useState } from "react";
import { useChatHistory, ChatConversation } from "@/hooks/chat/useChatHistory";
import { useChat } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  History, 
  Trash, 
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { TypingIndicator } from "../components/TypingIndicator";
import { toast } from "sonner";

export function ChatHistorySidebar() {
  const { conversations, isLoading, refreshHistory, deleteConversation } = useChatHistory();
  const { restoreConversation, clearMessages, isLoading: isChatLoading } = useChat();

  // Handle restoring a conversation
  const handleRestoreConversation = (conversation: ChatConversation) => {
    try {
      // First clear existing messages
      clearMessages();
      
      // Then restore the conversation messages
      restoreConversation(conversation.messages);
      
      toast.success("Conversation restored");
    } catch (error) {
      console.error("Error restoring conversation:", error);
      toast.error("Failed to restore conversation");
    }
  };

  if (isLoading) {
    return (
      <div className="py-1 flex justify-center">
        <TypingIndicator />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-2 px-2">
        <History className="mx-auto h-6 w-6 text-muted-foreground/50 mb-1" />
        <p className="text-xs text-muted-foreground">
          Your chat history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-medium">Previous Conversations</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => refreshHistory()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh history</span>
        </Button>
      </div>
      
      <ScrollArea className="h-[160px] px-1">
        <div className="space-y-0.5">
          {conversations.map((conversation) => (
            <div 
              key={conversation.id}
              className="group flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-accent transition-colors cursor-pointer"
            >
              <div 
                className="flex-1 truncate"
                onClick={() => handleRestoreConversation(conversation)}
              >
                <p className="font-medium truncate">{conversation.title}</p>
                <p className="text-xs text-muted-foreground truncate">{conversation.preview}</p>
              </div>
              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                >
                  <Trash className="h-3 w-3 text-muted-foreground" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
