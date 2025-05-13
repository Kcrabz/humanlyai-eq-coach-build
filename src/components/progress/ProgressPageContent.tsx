import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ProgressNavigation } from "@/components/progress/ProgressNavigation";
import { progressTabs } from "@/components/progress/ProgressTabs";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAuth } from "@/context/AuthContext";
import { useEQProgress } from "@/hooks/useEQProgress";

// Import tabs
import { OverviewTab } from "@/components/progress/OverviewTab";
import { AchievementsTab } from "@/components/progress/AchievementsTab";
import { ChallengesTab } from "@/components/progress/ChallengesTab";
import { EQJourneyTab } from "@/components/progress/EQJourneyTab";
import { BadgesCertificatesTab } from "@/components/progress/BadgesCertificatesTab";

export const ProgressPageContent = () => {
  const { user, stats, userArchetype } = useUserProgress();
  const { userAchievements } = useAuth();
  const { recentBreakthroughs } = useEQProgress();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  
  const handleChallengeTakeToChatPage = () => {
    navigate("/chat");
  };
  
  // Create timeline items from breakthroughs and achievements
  const generateTimelineItems = () => {
    const items = [];
    
    // Add recent breakthroughs
    if (recentBreakthroughs) {
      recentBreakthroughs.slice(0, 3).forEach((breakthrough, index) => {
        const date = new Date(breakthrough.detectedAt);
        items.push({
          date: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          title: `EQ Breakthrough: ${breakthrough.category}`,
          description: breakthrough.insight || "You gained an emotional intelligence insight",
          icon: "Lightbulb"
        });
      });
    }
    
    // Add achievements
    if (userAchievements) {
      userAchievements.filter(a => a.achieved).slice(0, 3).forEach((achievement) => {
        const date = achievement.achievedAt ? 
          new Date(achievement.achievedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) :
          "Recent Achievement";
          
        items.push({
          date,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon
        });
      });
    }
    
    // Add current focus as the last item
    items.push({
      date: "Current Focus",
      title: "Building Emotional Awareness",
      description: "Your current growth focus is on recognizing emotional patterns.",
      icon: "Flag",
      isCurrent: true,
      progress: stats.archetypeProgress
    });
    
    // Sort by date, keeping "Current Focus" at the end
    const sortedItems = items.filter(item => item.date !== "Current Focus").sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
    
    // Add current focus at the end
    const currentFocus = items.find(item => item.date === "Current Focus");
    if (currentFocus) {
      sortedItems.push(currentFocus);
    }
    
    return sortedItems;
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 animate-fade-in">
      <div className="mb-8 header-fade-in">
        <h1 className="text-3xl font-bold mb-2">Your EQ Progress</h1>
        <p className="text-muted-foreground">
          Track your emotional intelligence journey and achievements
        </p>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="animate-scale-fade-in">
        <ProgressNavigation 
          tabs={progressTabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="animate-scale-fade-in">
          <OverviewTab 
            stats={stats} 
            achievements={userAchievements?.filter(a => a.achieved).slice(0, 4) || []}
            userArchetype={userArchetype}
            onChallengeClick={handleChallengeTakeToChatPage} 
          />
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="animate-scale-fade-in">
          <AchievementsTab achievements={userAchievements?.filter(a => a.achieved) || []} />
        </TabsContent>
        
        {/* Badges & Certificates Tab */}
        <TabsContent value="badges" className="animate-scale-fade-in">
          <BadgesCertificatesTab 
            badges={userAchievements?.filter(a => {
              // Map achievements to badge/certificate format based on their properties
              // Using a broader approach instead of direct type comparison
              return a.achieved && (
                a.title.toLowerCase().includes('badge') || 
                a.title.toLowerCase().includes('certificate') ||
                a.description.toLowerCase().includes('badge') || 
                a.description.toLowerCase().includes('certificate')
              );
            })
              .map(a => ({
                id: a.id,
                // Determine type based on title/description
                type: a.title.toLowerCase().includes('certificate') || 
                      a.description.toLowerCase().includes('certificate') ? 
                      "certificate" as const : "badge" as const,
                name: a.title,
                description: a.description,
                dateEarned: a.achievedAt ? new Date(a.achievedAt).toLocaleDateString('en-US', 
                  { month: 'long', day: 'numeric', year: 'numeric' }) : "Not yet earned",
                category: a.type
              })) || []}
          />
        </TabsContent>
        
        {/* Challenges Tab */}
        <TabsContent value="challenges" className="animate-scale-fade-in">
          <ChallengesTab onChallengeClick={handleChallengeTakeToChatPage} />
        </TabsContent>
        
        {/* EQ Journey Tab */}
        <TabsContent value="journey" className="animate-scale-fade-in">
          <EQJourneyTab 
            userArchetype={userArchetype}
            timelineItems={generateTimelineItems()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
