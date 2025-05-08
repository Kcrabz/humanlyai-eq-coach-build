
import React, { useEffect } from "react";
import { useChatHistory, ChatConversation } from "@/hooks/chat/useChatHistory";
import { useChat } from "@/context/ChatContext";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { 
  Trash, 
  History, 
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { TypingIndicator } from "./components/TypingIndicator";
import { toast } from "sonner";

interface ChatHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatHistoryPanel({ open, onOpenChange }: ChatHistoryPanelProps) {
  const { conversations, isLoading, refreshHistory, deleteConversation } = useChatHistory();
  const { clearMessages, restoreConversation, isLoading: isChatLoading } = useChat();
  
  // Force refresh when panel opens to ensure we have the latest data
  useEffect(() => {
    if (open) {
      refreshHistory();
    }
  }, [open, refreshHistory]);
  
  // Handle restoring a conversation
  const handleRestoreConversation = (conversation: ChatConversation) => {
    try {
      // First clear existing messages
      clearMessages();
      
      // Then restore the conversation messages
      restoreConversation(conversation.messages);
      
      // Close the history panel
      onOpenChange(false);
      
      toast.success("Conversation restored");
    } catch (error) {
      console.error("Error restoring conversation:", error);
      toast.error("Failed to restore conversation");
    }
  };

  // When nothing is in history yet
  if (!isLoading && conversations.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chat History</DialogTitle>
            <DialogDescription>
              You don't have any saved conversations yet.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                Your chat history will appear here once you start having conversations.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chat History</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refreshHistory()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </DialogTitle>
          <DialogDescription>
            View and restore your previous conversations.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <TypingIndicator />
          </div>
        ) : (
          <ScrollArea className="h-[50vh]">
            <div className="space-y-4 pr-4">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className="p-4 hover:bg-accent transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between">
                    <div 
                      className="flex-1"
                      onClick={() => handleRestoreConversation(conversation)}
                    >
                      <h3 className="font-medium">{conversation.title}</h3>
                      <p className="text-sm text-muted-foreground">{conversation.preview}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.last_updated).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
