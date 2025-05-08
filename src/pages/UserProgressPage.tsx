import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Award, Calendar, Check, Clock, Flag, MessageCircle, Star, Trophy } from "lucide-react";
import { StreakTracker } from "@/components/chat/sidebar/StreakTracker";
import { DailyChallenge } from "@/components/chat/sidebar/DailyChallenge";
import { ProgressTracker } from "@/components/chat/sidebar/ProgressTracker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";
import { useNavigate } from "react-router-dom";

// Mock progress data - this would come from your backend in a real implementation
const MOCK_ACHIEVEMENTS = [
  { id: 1, name: "First Conversation", description: "Complete your first chat with your EQ coach", date: "2025-04-28", icon: <MessageCircle className="h-4 w-4" /> },
  { id: 2, name: "Consistent Practice", description: "Chat with your coach for 3 days in a row", date: "2025-05-01", icon: <Calendar className="h-4 w-4" /> },
  { id: 3, name: "Self Reflection", description: "Complete your first self-reflection exercise", date: "2025-05-03", icon: <Star className="h-4 w-4" /> },
  { id: 4, name: "Active Listener", description: "Practice active listening skills in conversation", date: "2025-05-04", icon: <Award className="h-4 w-4" /> },
];

const MOCK_CHALLENGE_HISTORY = [
  { id: 1, title: "Express appreciation", completed: true, date: "2025-05-01" },
  { id: 2, name: "Notice emotional patterns", completed: true, date: "2025-05-03" },
  { id: 3, name: "Set a boundary today", completed: true, date: "2025-05-04" },
  { id: 4, name: "Practice patience", completed: true, date: "2025-05-05" },
  { id: 5, name: "Embrace uncertainty", completed: false, date: "2025-05-06" },
];

const UserProgressPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  
  // Stats that would be fetched from a real backend
  const [stats, setStats] = useState({
    totalSessions: 12,
    challengesCompleted: 4,
    currentStreak: 5,
    longestStreak: 7,
    eq_archetype: user?.eq_archetype || "innovator",
    archetypeProgress: 65, // percentage
    totalMinutes: 45,
    totalReflections: 8
  });
  
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
  
  const userArchetype = user?.eq_archetype as EQArchetype | undefined || "innovator";
  const archetype = userArchetype ? ARCHETYPES[userArchetype] : null;
  
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-humanly-teal" />
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
                      <span className="text-2xl font-bold text-humanly-teal">{stats.totalSessions}</span>
                      <span className="text-xs text-gray-600">Sessions</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
                      <span className="text-2xl font-bold text-humanly-teal">{stats.challengesCompleted}</span>
                      <span className="text-xs text-gray-600">Challenges</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
                      <span className="text-2xl font-bold text-humanly-teal">{stats.currentStreak}</span>
                      <span className="text-xs text-gray-600">Day Streak</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-humanly-teal/10 rounded-lg">
                      <span className="text-2xl font-bold text-humanly-teal">{stats.totalMinutes}</span>
                      <span className="text-xs text-gray-600">Minutes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Streak tracker */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-humanly-teal" />
                    Activity Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StreakTracker />
                </CardContent>
              </Card>
              
              {/* Archetype journey */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {archetype && (
                      <span className="text-lg" title={archetype.title}>{archetype.icon}</span>
                    )}
                    Your Archetype Journey
                  </CardTitle>
                  <CardDescription>
                    {archetype?.description || "Discover your EQ archetype"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Growth progress</span>
                      <span className="text-sm font-medium">{stats.archetypeProgress}%</span>
                    </div>
                    <Progress value={stats.archetypeProgress} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Your strengths:</h4>
                    <ul className="text-sm space-y-1">
                      {archetype?.strengths.slice(0, 2).map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-500 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Growth areas:</h4>
                    <ul className="text-sm space-y-1">
                      {archetype?.growthAreas.slice(0, 2).map((area, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Flag className="h-4 w-4 text-amber-500 mt-0.5" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              {/* Current challenge */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-humanly-teal" />
                    Today's Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DailyChallenge standaloneMode={true} onChallengeClick={handleChallengeTakeToChatPage} />
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Achievements */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-humanly-teal" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOCK_ACHIEVEMENTS.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm text-center space-y-2">
                      <div className="h-12 w-12 rounded-full bg-humanly-teal/10 text-humanly-teal flex items-center justify-center mx-auto">
                        {achievement.icon || <Award className="h-6 w-6" />}
                      </div>
                      <h3 className="font-medium text-sm">{achievement.name}</h3>
                      <p className="text-xs text-muted-foreground">{achievement.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-humanly-teal" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Track your growth and milestones in emotional intelligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {MOCK_ACHIEVEMENTS.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="h-12 w-12 rounded-full bg-humanly-teal/10 text-humanly-teal flex items-center justify-center flex-shrink-0">
                        {achievement.icon || <Award className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Earned on {achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-humanly-teal" />
                      Today's Challenge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DailyChallenge standaloneMode={true} onChallengeClick={handleChallengeTakeToChatPage} />
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flag className="h-5 w-5 text-humanly-teal" />
                      Challenge History
                    </CardTitle>
                    <CardDescription>
                      View your previous daily challenges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {MOCK_CHALLENGE_HISTORY.map((challenge) => (
                        <div key={challenge.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              challenge.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              {challenge.completed ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Clock className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-medium">{challenge.title || challenge.name}</h3>
                              <p className="text-xs text-gray-500">{challenge.date}</p>
                            </div>
                          </div>
                          {challenge.completed && (
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* EQ Journey Tab */}
          <TabsContent value="journey">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {archetype && (
                        <span className="text-lg" title={archetype.title}>{archetype.icon}</span>
                      )}
                      Your Archetype
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-humanly-teal">{archetype?.title || "Innovator"}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{archetype?.description || "Your description"}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Your strengths:</h4>
                      <ul className="text-sm space-y-2">
                        {archetype?.strengths.map((strength, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Growth areas:</h4>
                      <ul className="text-sm space-y-2">
                        {archetype?.growthAreas.map((area, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Flag className="h-4 w-4 text-amber-500 mt-0.5" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-humanly-teal" />
                      Growth Timeline
                    </CardTitle>
                    <CardDescription>
                      Your EQ development over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pt-2">
                      {/* Timeline elements */}
                      <div className="absolute top-0 bottom-0 left-4 w-[2px] bg-gray-200"></div>
                      
                      <div className="space-y-8">
                        {/* Timeline item 1 */}
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-humanly-teal flex items-center justify-center text-white">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">April 28, 2025</p>
                            <h3 className="font-medium text-base">Started Your EQ Journey</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              You completed your EQ assessment and discovered your archetype.
                            </p>
                          </div>
                        </div>
                        
                        {/* Timeline item 2 */}
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-humanly-teal flex items-center justify-center text-white">
                            <MessageCircle className="h-4 w-4" />
                          </div>
                          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">May 1, 2025</p>
                            <h3 className="font-medium text-base">First Week Streak</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              You've been consistent with your EQ practice for 7 days.
                            </p>
                          </div>
                        </div>
                        
                        {/* Timeline item 3 */}
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-humanly-teal flex items-center justify-center text-white">
                            <Award className="h-4 w-4" />
                          </div>
                          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">May 4, 2025</p>
                            <h3 className="font-medium text-base">Self-Reflection Master</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              You've completed 5 self-reflection exercises.
                            </p>
                          </div>
                        </div>
                        
                        {/* Current focus */}
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                            <Flag className="h-4 w-4" />
                          </div>
                          <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">Current Focus</p>
                            <h3 className="font-medium text-base">Building Emotional Awareness</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your current growth focus is on recognizing emotional patterns.
                            </p>
                            <div className="mt-3">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs font-medium">Progress</span>
                                <span className="text-xs font-medium">45%</span>
                              </div>
                              <Progress value={45} className="h-2" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default UserProgressPage;
