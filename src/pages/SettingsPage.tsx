
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import TwoFactorSetup from "@/components/settings/TwoFactorSetup";
import BioEditor from "@/components/settings/BioEditor";
import { EmailPreferences } from "@/components/settings/EmailPreferences";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { isAuthenticated } = useAuth();

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Please log in to access your settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-4">
                You need to be logged in to view and edit your settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-6">Settings</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <BioEditor className="mb-6" />
            
            {/* Other profile settings would go here */}
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <TwoFactorSetup />
            
            {/* Other security settings would go here */}
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <EmailPreferences />
            
            {/* Other notification settings would go here */}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
