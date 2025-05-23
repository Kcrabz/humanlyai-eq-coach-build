import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { UserManagement } from "@/components/admin/UserManagement";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Loading } from "@/components/ui/loading";
import { FilterState } from "@/hooks/useUserManagement/types";
import EmailManagement from '@/components/admin/email-management/EmailManagement';

const AdminPage = () => {
  const { isAdmin, isLoading: isAdminCheckLoading } = useAdminCheck();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentFilter, setCurrentFilter] = useState<FilterState | null>(null);
  const [isUserMounted, setIsUserMounted] = useState(false);

  // Check if user is an admin and redirect if not
  useEffect(() => {
    if (!isAuthLoading && !isAdminCheckLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin portal.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
    }
    
    // Mark components as ready to mount after a short delay
    const timer = setTimeout(() => {
      setIsUserMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isAdmin, isAuthLoading, isAdminCheckLoading, navigate, toast]);

  // Handle filter changes from the overview components
  const handleFilterChange = useCallback((filter: FilterState) => {
    setCurrentFilter(filter);
    setActiveTab("users"); // Switch to users tab when a filter is applied
  }, []);

  // Reset filter
  const handleResetFilter = useCallback(() => {
    setCurrentFilter(null);
  }, []);

  if (isAuthLoading || isAdminCheckLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loading size="large" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
        <p className="text-muted-foreground mb-6">
          Manage users and application settings
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="emails">Email Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverview onFilterChange={handleFilterChange} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {isUserMounted && (
              <UserManagement 
                initialFilter={currentFilter || undefined} 
                onResetFilter={handleResetFilter}
              />
            )}
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <EmailManagement />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default AdminPage;
