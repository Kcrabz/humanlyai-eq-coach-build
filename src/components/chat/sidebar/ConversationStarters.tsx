
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

// Define starter prompts (reduced number for cleaner UI)
const STARTER_PROMPTS = [
  "How can I recognize my emotional triggers?",
  "What techniques help calm intense emotions?",
  "How can I better read emotional cues from others?",
  "What strategies build deeper connections with others?"
];

export function ConversationStarters() {
  const { user } = useAuth();
  const { sendMessage } = useChat();
  const navigate = useNavigate();
  
  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };
  
  return (
    <div className="space-y-1">
      <h3 className="text-xs uppercase font-medium text-muted-foreground">Quick Start</h3>
      
      <div className="grid grid-cols-1 gap-1">
        {STARTER_PROMPTS.map((prompt, index) => (
          <Button 
            key={index}
            variant="ghost"
            size="sm"
            className="h-auto py-1 px-2 justify-start text-xs font-normal text-left hover:bg-humanly-pastel-lavender/10"
            onClick={() => handlePromptClick(prompt)}
          >
            <MessageSquare className="h-3 w-3 mr-1.5 text-humanly-teal flex-shrink-0" />
            <span className="truncate">{prompt}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
