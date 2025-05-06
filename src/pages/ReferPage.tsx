
import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Copy, Mail, Send } from "lucide-react";
import { toast } from "sonner";

const ReferPage = () => {
  const [email, setEmail] = useState("");
  const referralLink = `${window.location.origin}/signup?ref=${encodeURIComponent(
    localStorage.getItem("supabase.auth.token") || "user"
  )}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    // This would typically integrate with a backend email service
    // For now, we'll just show a success message
    toast.success(`Invitation sent to ${email}!`);
    setEmail("");
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Refer a Friend</h1>
          <p className="text-center text-muted-foreground mb-8">
            Share HumanlyAI with your friends and colleagues
          </p>

          <Card className="mb-8 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-humanly-teal" /> 
                Your Personal Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input 
                  value={referralLink} 
                  readOnly 
                  className="font-medium text-sm border-humanly-teal/20"
                />
                <Button 
                  onClick={copyToClipboard} 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                  onClick={() => {
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        "I've been using HumanlyAI for emotional intelligence coaching, and it's amazing! Check it out: "
                      )}&url=${encodeURIComponent(referralLink)}`,
                      "_blank"
                    );
                  }}
                >
                  Share on Twitter
                </Button>
                <Button 
                  className="flex-1 bg-[#3b5998] hover:bg-[#2d4373]"
                  onClick={() => {
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
                      "_blank"
                    );
                  }}
                >
                  Share on Facebook
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-humanly-teal" />
                Invite by Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={sendEmail} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-humanly-teal/20"
                />
                <Button type="submit" className="whitespace-nowrap">
                  <Send className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ReferPage;
