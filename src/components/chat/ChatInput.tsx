
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChat } from "@/context/ChatContext";
import { Loading } from "@/components/ui/loading";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const { sendMessage, isLoading } = useChat();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    await sendMessage(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-background sticky bottom-0">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={isLoading}
        />
        <Button 
          type="submit"
          disabled={isLoading || !message.trim()}
          className="self-end"
        >
          {isLoading ? <Loading size="small" /> : "Send"}
        </Button>
      </div>
    </form>
  );
}
