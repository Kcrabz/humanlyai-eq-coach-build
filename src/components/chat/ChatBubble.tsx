
import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/logo-avatar.png" alt="HumanlyAI Coach" />
          <AvatarFallback className="bg-humanly-teal text-white">HA</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "rounded-lg px-4 py-3 text-sm",
          isUser
            ? "bg-humanly-teal text-white"
            : "bg-humanly-gray-lightest border"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={cn(
            "text-[10px] mt-1 text-right",
            isUser ? "text-humanly-teal-light" : "text-muted-foreground"
          )}
        >
          {formatDate(message.created_at)}
        </div>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
