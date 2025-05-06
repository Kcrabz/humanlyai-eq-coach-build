
import { useState, useEffect } from "react";
import { ActiveFilter } from "./ActiveFilter";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserManagementProps {
  initialFilter?: { type: string; value: string };
  onResetFilter?: () => void;
}

export const UserManagement = ({ initialFilter, onResetFilter }: UserManagementProps) => {
  const {
    users,
    isLoading,
    searchTerm,
    setSearchTerm,
    tierFilter,
    setTierFilter,
    archetypeFilter,
    setArchetypeFilter,
    activeFilter,
    resetFilters,
    fetchUsers,
    handleUpdateTier
  } = useUserManagement(initialFilter);

  const [exportLoading, setExportLoading] = useState(false);

  // Handle reset filter including parent component notification
  const handleResetFilters = () => {
    resetFilters();
    if (onResetFilter) {
      onResetFilter();
    }
  };

  // Export users to CSV
  const handleExportCsv = async () => {
    try {
      setExportLoading(true);
      console.log("Starting CSV export...");
      
      // Get current auth session to include in the request
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting auth session:", sessionError);
        toast.error("Authentication error", { description: "Please try logging in again" });
        return;
      }
      
      if (!sessionData.session) {
        console.error("No active session found");
        toast.error("Authentication error", { description: "Please log in again" });
        return;
      }
      
      console.log("Got authenticated session, calling export function...");
      
      // Call the edge function with proper authentication and error handling
      const { data, error } = await supabase.functions.invoke('admin-export-users-csv', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: { filters: { searchTerm, tierFilter, archetypeFilter } }
      });
      
      if (error) {
        console.error("Error exporting users:", error);
        toast.error("Failed to export users", { 
          description: error.message || "An unknown error occurred" 
        });
        return;
      }
      
      if (!data || data.error) {
        console.error("Error in edge function response:", data?.error || "No data returned");
        toast.error("Failed to export users", { 
          description: data?.error || "No data returned from server" 
        });
        return;
      }
      
      console.log("Export data received successfully, size:", data.length);
      
      // Create a blob from the CSV data
      const blob = new Blob([data], { type: 'text/csv' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("User data exported successfully");
    } catch (err) {
      console.error("Failed to export users:", err);
      toast.error("An unexpected error occurred while exporting users");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active filter indicator */}
      <ActiveFilter activeFilter={activeFilter} onReset={handleResetFilters} />
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full">
          <UserFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tierFilter={tierFilter}
            setTierFilter={setTierFilter}
            archetypeFilter={archetypeFilter}
            setArchetypeFilter={setArchetypeFilter}
            onRefresh={fetchUsers}
          />
        </div>
        
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

      {/* User table */}
      <UserTable 
        users={users}
        isLoading={isLoading}
        onUpdateTier={handleUpdateTier}
      />
    </div>
  );
};
