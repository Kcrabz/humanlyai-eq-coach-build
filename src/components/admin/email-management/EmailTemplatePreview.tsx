
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailTemplatePreviewProps {
  open: boolean;
  onClose: () => void;
}

export default function EmailTemplatePreview({ open, onClose }: EmailTemplatePreviewProps) {
  const [activeTemplate, setActiveTemplate] = React.useState("daily-nudge");

  // Mock data for the preview
  const mockData = {
    "daily-nudge": {
      name: "Sample User",
      challengeText: "Practice mindfulness for 5 minutes during your next stressful situation. Take deep breaths and observe your emotions without judgment.",
      currentStreak: 5
    },
    "weekly-summary": {
      name: "Sample User",
      sessionsCompleted: 8,
      challengesCompleted: 5,
      breakthroughsCount: 2,
      personalisedInsight: "You've shown consistent growth in self-awareness this week. Consider focusing on empathetic listening in your upcoming interactions."
    },
    "re-engagement": {
      name: "Sample User",
      daysSinceLastLogin: 12,
      personalisedPrompt: "Emotional intelligence development happens through consistent practice. Even 5 minutes a day can lead to significant improvement over time."
    }
  };

  // Simplified versions of the email templates for preview
  const renderPreviewTemplate = (template: string) => {
    const appUrl = 'https://humanly.ai';
    const brandColor = '#4F46E5';
    const userName = mockData[template as keyof typeof mockData]?.name || 'there';

    switch (template) {
      case 'daily-nudge':
        const { challengeText, currentStreak } = mockData["daily-nudge"];
        
        return (
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-800">Humanly Logo</div>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Your Daily EQ Challenge</h2>
            
            <p className="mb-4">Hi {userName},</p>
            
            <p className="mb-4">It's time for your daily emotional intelligence practice! Consistent practice leads to meaningful growth.</p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="font-semibold">Today's Challenge:</p>
              <p className="italic">{challengeText}</p>
            </div>
            
            <p className="mb-4">
              Your current streak: 
              <span className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {currentStreak} days
              </span>
            </p>
            
            <div className="text-center my-6">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium">
                Start Today's Challenge
              </button>
            </div>
            
            <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4 mt-8">
              <p>Humanly AI - Developing Emotional Intelligence</p>
              <p className="mt-1">
                <a href="#" className="underline">Manage email preferences</a>
                {" | "}
                <a href="#" className="underline">Visit Humanly</a>
              </p>
            </div>
          </div>
        );
      
      case 'weekly-summary':
        const { sessionsCompleted, challengesCompleted, breakthroughsCount, personalisedInsight } = mockData["weekly-summary"];
        const progressPercentage = Math.min(Math.round((challengesCompleted / 7) * 100), 100);
        
        return (
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-800">Humanly Logo</div>
            </div>
            
            <h2 className="text-xl font-bold mb-4">Your Weekly EQ Progress</h2>
            
            <p className="mb-4">Hi {userName},</p>
            
            <p className="mb-4">Here's a snapshot of your emotional intelligence journey this week:</p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="flex justify-between mb-2">
                <div className="text-gray-600">Sessions completed</div>
                <div className="font-semibold">{sessionsCompleted}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div className="text-gray-600">Challenges completed</div>
                <div className="font-semibold">{challengesCompleted}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div className="text-gray-600">EQ breakthroughs</div>
                <div className="font-semibold">{breakthroughsCount}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div className="text-gray-600">Weekly progress</div>
                <div className="font-semibold">{progressPercentage}%</div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div 
                  className="h-2 bg-indigo-600 rounded-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="font-semibold">Your personalized insight:</p>
              <p className="italic">{personalisedInsight}</p>
            </div>
            
            <div className="text-center my-6">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium">
                View Detailed Progress
              </button>
            </div>
            
            <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4 mt-8">
              <p>Humanly AI - Developing Emotional Intelligence</p>
              <p className="mt-1">
                <a href="#" className="underline">Manage email preferences</a>
                {" | "}
                <a href="#" className="underline">Visit Humanly</a>
              </p>
            </div>
          </div>
        );
      
      case 're-engagement':
        const { daysSinceLastLogin, personalisedPrompt } = mockData["re-engagement"];
        
        return (
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="text-2xl font-bold text-gray-800">Humanly Logo</div>
            </div>
            
            <h2 className="text-xl font-bold mb-4">We've Missed You!</h2>
            
            <p className="mb-4">Hi {userName},</p>
            
            <p className="mb-4">It's been {daysSinceLastLogin} days since your last session. Your EQ journey is waiting for you to return!</p>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
              <p className="font-semibold">A thought for you:</p>
              <p className="italic">{personalisedPrompt}</p>
            </div>
            
            <p className="font-medium mb-4">Here's why it's worth coming back:</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold text-sm">✓</span>
                </div>
                <div>Your progress is saved and ready to continue</div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold text-sm">✓</span>
                </div>
                <div>New insights are waiting based on your profile</div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0 h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-indigo-600 font-bold text-sm">✓</span>
                </div>
                <div>Just 5 minutes a day can build lasting EQ skills</div>
              </div>
            </div>
            
            <div className="text-center my-6">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium">
                Resume Your Journey
              </button>
            </div>
            
            <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4 mt-8">
              <p>Humanly AI - Developing Emotional Intelligence</p>
              <p className="mt-1">
                <a href="#" className="underline">Manage email preferences</a>
                {" | "}
                <a href="#" className="underline">Visit Humanly</a>
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <p>Select a template to preview</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Template Preview</DialogTitle>
          <DialogDescription>
            Preview the enhanced email templates
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="daily-nudge" value={activeTemplate} onValueChange={setActiveTemplate}>
          <TabsList className="mb-4">
            <TabsTrigger value="daily-nudge">Daily Nudge</TabsTrigger>
            <TabsTrigger value="weekly-summary">Weekly Summary</TabsTrigger>
            <TabsTrigger value="re-engagement">Re-engagement</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily-nudge" className="mt-4 overflow-auto">
            {renderPreviewTemplate('daily-nudge')}
          </TabsContent>
          
          <TabsContent value="weekly-summary" className="mt-4 overflow-auto">
            {renderPreviewTemplate('weekly-summary')}
          </TabsContent>
          
          <TabsContent value="re-engagement" className="mt-4 overflow-auto">
            {renderPreviewTemplate('re-engagement')}
          </TabsContent>
        </Tabs>

        <div className="bg-muted p-4 rounded mt-4">
          <p className="text-sm text-muted-foreground">
            Note: This is a simplified preview. The actual email will be fully responsive and may appear slightly different in email clients.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
