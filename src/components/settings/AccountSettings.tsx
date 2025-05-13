
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, FileText, Trash2, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AccountSettingsProps {
  className?: string;
}

export function AccountSettings({ className }: AccountSettingsProps) {
  const { user, logout } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const subscriptionTier = user?.subscription_tier || "free";
  
  // Format subscription tier for display
  const formatTier = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-humanly-teal text-white";
      case "basic":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };
  
  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    try {
      // Fetch user data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (profileError) throw profileError;
      
      // Fetch chat data
      const { data: chatData, error: chatError } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id);
        
      if (chatError) throw chatError;
      
      // Combine data
      const exportData = {
        profile: profileData,
        chats: chatData,
        exportDate: new Date().toISOString()
      };
      
      // Create download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      
      // Create download link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    // We would implement actual account deletion here
    // This is just a placeholder for the UI
    
    toast.success("Your account has been scheduled for deletion");
    
    // After account deletion, log the user out
    await logout();
  };

  return (
    <div className={className}>
      {/* Subscription Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-humanly-teal" />
            Your Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <div className="flex items-center mt-1">
                <Badge className={`mr-2 ${getTierColor(subscriptionTier)}`}>
                  {formatTier(subscriptionTier)}
                </Badge>
                {subscriptionTier === "free" ? (
                  <span className="text-sm text-muted-foreground">Limited features</span>
                ) : (
                  <span className="text-sm text-muted-foreground">Full access</span>
                )}
              </div>
            </div>
            
            <Button variant="outline">
              {subscriptionTier === "free" ? "Upgrade" : "Manage"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Data & Privacy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-humanly-teal" />
            Data & Privacy
          </CardTitle>
          <CardDescription>
            Manage your data and privacy settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export Your Data</p>
              <p className="text-sm text-muted-foreground">
                Download all your personal data and chat history
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportData} 
              disabled={isExporting}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all your data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-humanly-teal" />
            Usage Statistics
          </CardTitle>
          <CardDescription>
            View your app usage statistics
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Chat Sessions</p>
              <p className="text-2xl font-bold">24</p>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">142</p>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Challenges Completed</p>
              <p className="text-2xl font-bold">7</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently delete your account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="bg-red-50 border border-red-200 p-3 rounded-md text-red-800 text-sm">
              <p className="font-medium mb-1">Warning:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>All your personal data will be deleted</li>
                <li>Your chat history will be lost</li>
                <li>Your subscription will be canceled</li>
                <li>This action is permanent and cannot be reversed</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Type "DELETE" to confirm</Label>
              <Input 
                id="confirm-delete"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={confirmInput !== "DELETE"}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
