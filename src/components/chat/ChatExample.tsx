
import { EnhancedChatUI } from "./EnhancedChatUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatProvider } from "@/context/ChatContext";
import { ChatUsage } from "./ChatUsage";

export function ChatExample() {
  return (
    <div className="w-full h-[600px]">
      <Card className="h-full enhanced-card">
        <CardHeader>
          <CardTitle>Chat with AI Assistant</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-64px)] flex flex-col">
          <ChatProvider>
            {/* Both components are now safely within ChatProvider */}
            <ChatUsage />
            <div className="flex-1 overflow-hidden">
              <EnhancedChatUI />
            </div>
          </ChatProvider>
        </CardContent>
      </Card>
    </div>
  );
}
