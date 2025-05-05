
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";

// Define starter prompts based on common EQ topics
const STARTER_PROMPTS = [
  {
    category: "Self-awareness",
    prompts: [
      "How can I better recognize my emotional triggers?",
      "What strategies help identify emotions in the moment?",
      "How might my personality type influence my reactions?"
    ]
  },
  {
    category: "Emotional regulation",
    prompts: [
      "What techniques help calm intense emotions?",
      "How can I respond better under pressure?",
      "What's a healthy way to process disappointment?"
    ]
  },
  {
    category: "Social awareness",
    prompts: [
      "How can I better read emotional cues from others?",
      "What helps improve empathetic listening?",
      "How might I recognize when someone needs support?"
    ]
  },
  {
    category: "Relationship management",
    prompts: [
      "What approaches help resolve conflicts productively?",
      "How can I communicate difficult feelings effectively?",
      "What strategies build deeper connections with others?"
    ]
  }
];

export function ConversationStarters() {
  const { user } = useAuth();
  const { sendMessage } = useChat();
  const navigate = useNavigate();
  
  // Get prompts most relevant to the user's archetype, or default to general prompts
  const getRelevantPrompts = () => {
    const archetype = user?.eq_archetype;
    
    // For now just returning the first two categories
    // In a real implementation, we'd match prompts to the user's archetype
    return STARTER_PROMPTS.slice(0, 2);
  };
  
  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };
  
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase font-semibold text-muted-foreground">Start a conversation</h3>
      
      {getRelevantPrompts().map((category) => (
        <div key={category.category} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground ml-1">{category.category}</p>
          
          {category.prompts.slice(0, 2).map((prompt, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border-humanly-teal/10 bg-white"
              onClick={() => handlePromptClick(prompt)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <span className="text-humanly-teal p-1 rounded-full bg-humanly-teal/10">
                  <MessageSquare className="h-3 w-3" />
                </span>
                <p className="text-xs text-gray-700">{prompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
