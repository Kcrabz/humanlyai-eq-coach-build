
import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { ProgressPageContent } from "@/components/progress/ProgressPageContent";

export const ProgressPageContainer: React.FC = () => {
  const { user, isLoading } = useUserProgress();
  const navigate = useNavigate();
  
  if (!user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="w-[400px] transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>Please sign in to view your progress</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild className="transition-all duration-300 hover:scale-105">
                <a href="/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
  // Show a loading state while data is being fetched
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-8 w-8 animate-spin text-humanly-teal" />
            <p className="text-muted-foreground">Loading your progress data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <ProgressPageContent />
    </PageLayout>
  );
};
