
import { EnhancedChatUI } from "./EnhancedChatUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ChatExample() {
  return (
    <div className="w-full h-[600px]">
      <Card className="h-full enhanced-card">
        <CardHeader>
          <CardTitle>Chat with AI Assistant</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-64px)]">
          <EnhancedChatUI />
        </CardContent>
      </Card>
    </div>
  );
}
