
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import AvatarSelector from "@/components/settings/AvatarSelector";
import BioEditor from "@/components/settings/BioEditor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">Manage your profile and preferences</p>
        
        <div className="space-y-8">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Customize how you appear to Kai and personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AvatarSelector />
              <Separator className="my-4" />
              <BioEditor />
            </CardContent>
          </Card>
          
          {/* App Configuration Section */}
          <Card>
            <CardHeader>
              <CardTitle>App Configuration</CardTitle>
              <CardDescription>
                View your subscription and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user && (
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <p className="text-sm">
                    Logged in as: <span className="font-medium">{user.email}</span>
                  </p>
                  <p className="text-sm">
                    Subscription tier: <span className="font-medium">{user.subscription_tier || "free"}</span>
                  </p>
                  {user.name && (
                    <p className="text-sm">
                      Name: <span className="font-medium">{user.name}</span>
                    </p>
                  )}
                  {user.eq_archetype && (
                    <p className="text-sm">
                      EQ Archetype: <span className="font-medium">{user.eq_archetype}</span>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
