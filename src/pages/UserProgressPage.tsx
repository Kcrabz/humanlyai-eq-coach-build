
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useUserProgress } from "@/hooks/useUserProgress";

// Import tabs
import { OverviewTab } from "@/components/progress/OverviewTab";
import { AchievementsTab } from "@/components/progress/AchievementsTab";
import { ChallengesTab } from "@/components/progress/ChallengesTab";
import { EQJourneyTab } from "@/components/progress/EQJourneyTab";

// Import mock data
import { MOCK_ACHIEVEMENTS, MOCK_CHALLENGE_HISTORY, MOCK_TIMELINE_ITEMS } from "@/data/mockProgressData";

const UserProgressPage = () => {
  const { user, stats, userArchetype } = useUserProgress();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  
  const handleChallengeTakeToChatPage = () => {
    navigate("/chat");
  };
  
  if (!user) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>Please sign in to view your progress</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <a href="/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your EQ Progress</h1>
          <p className="text-muted-foreground">
            Track your emotional intelligence journey and achievements
          </p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
            <TabsTrigger value="journey">EQ Journey</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab 
              stats={stats} 
              achievements={MOCK_ACHIEVEMENTS} 
              userArchetype={userArchetype} 
              onChallengeClick={handleChallengeTakeToChatPage} 
            />
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsTab achievements={MOCK_ACHIEVEMENTS} />
          </TabsContent>
          
          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <ChallengesTab 
              challenges={MOCK_CHALLENGE_HISTORY} 
              onChallengeClick={handleChallengeTakeToChatPage} 
            />
          </TabsContent>
          
          {/* EQ Journey Tab */}
          <TabsContent value="journey">
            <EQJourneyTab 
              userArchetype={userArchetype} 
              timelineItems={MOCK_TIMELINE_ITEMS} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default UserProgressPage;
