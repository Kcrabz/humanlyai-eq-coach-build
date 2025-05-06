
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { Separator } from "@/components/ui/separator";
import AvatarSelector from "@/components/settings/AvatarSelector";
import BioEditor from "@/components/settings/BioEditor";
import TwoFactorSetup from "@/components/settings/TwoFactorSetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button"; // Added button import

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">Manage your profile and preferences</p>
        
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="mb-4">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-8">
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
          </TabsContent>
          
          <TabsContent value="security" className="space-y-8">
            {/* Two-Factor Authentication */}
            <TwoFactorSetup />
            
            {/* Password Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-humanly-teal" />
                  Password Settings
                </CardTitle>
                <CardDescription>
                  Update your password or recovery options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Passwords should be at least 8 characters and include a mix of letters, numbers, and symbols.</p>
                <div className="flex justify-start">
                  <a href="/reset-password">
                    <Button className="bg-humanly-teal hover:bg-humanly-teal-dark">
                      Change Password
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
