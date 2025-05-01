
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-8">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">App Configuration</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This application uses a centralized API key for all users. 
              Individual API key configuration is not available.
            </p>
            
            {user && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  Logged in as: {user.email}
                </p>
                <p className="text-sm mt-2">
                  Subscription tier: {user.subscription_tier || "free"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
