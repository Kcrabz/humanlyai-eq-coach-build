
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUserManagementContext } from "./UserManagementContext";

export const UserManagementActions = () => {
  const { 
    searchTerm, 
    tierFilter, 
    archetypeFilter, 
    upgradeAllUsersToPremium 
  } = useUserManagementContext();
  
  const [exportLoading, setExportLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Export users to CSV
  const handleExportCsv = useCallback(async () => {
    if (exportLoading) return;
    
    try {
      setExportLoading(true);
      
      // Get current auth session to include in the request
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        toast.error("Authentication error", { description: "Please try logging in again" });
        return;
      }
      
      if (!sessionData.session) {
        toast.error("Authentication error", { description: "Please log in again" });
        return;
      }
      
      // Call the edge function with proper authentication
      const response = await supabase.functions.invoke('admin-export-users-csv', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        method: 'POST',
        body: { 
          filters: { searchTerm, tierFilter, archetypeFilter }
        }
      });
      
      if (response.error) {
        toast.error("Failed to export users", { 
          description: response.error.message || "An unexpected error occurred" 
        });
        return;
      }
      
      if (!response.data) {
        toast.error("Failed to export users", { description: "No data returned from server" });
        return;
      }
      
      // Handle CSV data
      const csvData = typeof response.data === 'string' 
        ? response.data 
        : JSON.stringify(response.data);
      
      // Create a blob and download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("User data exported successfully");
    } catch (err: any) {
      toast.error("Export failed", { 
        description: err?.message || "An unexpected error occurred while exporting users"
      });
    } finally {
      setExportLoading(false);
    }
  }, [searchTerm, tierFilter, archetypeFilter, exportLoading]);

  // Handle the upgrade all users button click
  const handleUpgradeAllUsers = useCallback(async () => {
    if (upgradeLoading) return;
    
    try {
      setUpgradeLoading(true);
      await upgradeAllUsersToPremium();
    } finally {
      setUpgradeLoading(false);
    }
  }, [upgradeAllUsersToPremium, upgradeLoading]);

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="whitespace-nowrap flex items-center"
        disabled={upgradeLoading}
        onClick={handleUpgradeAllUsers}
      >
        <Star className="h-4 w-4 mr-2 text-amber-500" />
        {upgradeLoading ? "Upgrading..." : "Upgrade All to Premium"}
      </Button>
      
      <Button 
        variant="outline" 
        className="whitespace-nowrap"
        disabled={exportLoading}
        onClick={handleExportCsv}
      >
        <Download className="h-4 w-4 mr-2" />
        {exportLoading ? "Exporting..." : "Export CSV"}
      </Button>
    </div>
  );
};
