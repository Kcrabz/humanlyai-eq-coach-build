
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export function ChatUsage() {
  // Try to use the chat context, but gracefully handle when it's not available
  let chatContext;
  try {
    chatContext = useChat();
  } catch (error) {
    console.log("ChatUsage: ChatContext not available, component will not render");
    return null; // Return null if not within a ChatProvider
  }

  const { usageInfo } = chatContext || {};
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Don't display anything if no usage info or if it's not relevant
  if (!usageInfo || !user) return null;
  
  const { currentUsage, limit, percentage } = usageInfo;
  
  // Only show for high usage (over 70%)
  if (percentage < 70) return null;
  
  return (
    <div className={`p-2 text-xs ${percentage > 95 ? 'bg-red-50' : 'bg-amber-50'} border-b`}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium">
          {percentage > 95 ? 'Token limit reached!' : 'Token usage warning'}
        </span>
        <button 
          onClick={() => navigate("/pricing")}
          className={`text-xs ${percentage > 95 ? 'text-red-600' : 'text-amber-600'} hover:underline`}
        >
          Upgrade Plan
        </button>
      </div>
      <Progress 
        value={percentage > 100 ? 100 : percentage} 
        className={`h-2 ${percentage > 95 ? 'bg-red-100' : 'bg-amber-100'}`} 
      />
      <div className="mt-1 flex justify-between">
        <span>{Math.floor(currentUsage).toLocaleString()} / {Math.floor(limit).toLocaleString()} tokens</span>
        <span>{Math.min(Math.round(percentage), 100)}%</span>
      </div>
    </div>
  );
}
