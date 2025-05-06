
import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const ReferPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Generate a referral link with the user's ID
  const referralLink = `${window.location.origin}?ref=${user?.id || ""}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically call an API to send the email
    toast.success(`Invitation sent to ${email}`);
    setEmail("");
  };

  return (
    <PageLayout>
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Share2 className="mx-auto h-12 w-12 text-humanly-teal mb-4" />
            <h1 className="text-3xl font-bold mb-2">Refer a Friend</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Share HumanlyAI with friends and colleagues. For each friend who signs up, you'll both receive bonus coaching credits!
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
            <h2 className="text-xl font-medium mb-4">Share your personal link</h2>
            
            <div className="flex items-center mb-6">
              <Input 
                value={referralLink} 
                readOnly 
                className="flex-1 border-r-0 rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="rounded-l-none border-l-0 hover:bg-humanly-pastel-mint/20"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Or invite via email</p>
            </div>
            
            <form onSubmit={handleSendEmail} className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit">
                Send Invite
              </Button>
            </form>
          </div>
          
          <div className="bg-white rounded-xl shadow-soft p-6">
            <h2 className="text-xl font-medium mb-4">How it works</h2>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Share your unique link with friends</li>
              <li>When they sign up using your link, they'll get 25% off their first month</li>
              <li>You'll receive 2 weeks of premium coaching for each friend who subscribes</li>
              <li>There's no limit to how many friends you can refer!</li>
            </ol>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ReferPage;
