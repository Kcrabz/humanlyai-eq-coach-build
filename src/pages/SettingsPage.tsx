
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/PageLayout";
import TwoFactorSetup from "@/components/settings/TwoFactorSetup";
import BioEditor from "@/components/settings/BioEditor";
import { EmailPreferences } from "@/components/settings/EmailPreferences";
import { useAuth } from "@/context/AuthContext";
import { PersonalInfoEditor } from "@/components/settings/PersonalInfoEditor";
import { ArchetypeSettings } from "@/components/settings/ArchetypeSettings";
import { CoachingPreferences } from "@/components/settings/CoachingPreferences";
import PasswordChanger from "@/components/settings/PasswordChanger";
import { SessionManagement } from "@/components/settings/SessionManagement";
import { AccountSettings } from "@/components/settings/AccountSettings";
import AvatarSelector from "@/components/settings/avatar/AvatarSelector";
import { User, Shield, Bell, CreditCard } from "lucide-react";

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
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6">Manage your account preferences and settings</p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="profile" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Profile</span>
              <span className="ml-1 sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Security</span>
              <span className="ml-1 sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Notifications</span>
              <span className="ml-1 sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Account</span>
              <span className="ml-1 sm:hidden">Account</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6 max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              <AvatarSelector />
              <PersonalInfoEditor />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <ArchetypeSettings />
              <CoachingPreferences />
            </div>

            <BioEditor />
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6 max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              <TwoFactorSetup />
              <PasswordChanger />
            </div>
            
            <SessionManagement />
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6 max-w-4xl">
            <EmailPreferences />
          </TabsContent>
          
          {/* Account Settings */}
          <TabsContent value="account" className="max-w-4xl">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
