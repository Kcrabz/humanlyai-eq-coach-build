
import { useNavigate } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { EQArchetype } from "@/types";
import { ARCHETYPES } from "@/lib/constants";

// Define some suggested activities
const SUGGESTED_ACTIVITIES = {
  empath: [
    { title: "Take the Self-Awareness Quiz", description: "Discover your emotional patterns", action: "quiz", params: { type: "self-awareness" } },
    { title: "Practice Boundary Setting", description: "Guided exercise for empaths", action: "activity", params: { id: "boundary-setting" } }
  ],
  validator: [
    { title: "Emotional Expression Exercise", description: "Learn to express emotions effectively", action: "quiz", params: { type: "expression" } },
    { title: "Active Listening Practice", description: "Improve connection with others", action: "activity", params: { id: "active-listening" } }
  ],
  innovator: [
    { title: "Creativity & Emotions Workshop", description: "Harness emotional energy creatively", action: "quiz", params: { type: "creativity" } },
    { title: "Social Impact Assessment", description: "Understand your impact on others", action: "activity", params: { id: "social-impact" } }
  ],
  harmonizer: [
    { title: "Assertiveness Training", description: "Express needs while maintaining harmony", action: "quiz", params: { type: "assertiveness" } },
    { title: "Conflict Resolution Scenarios", description: "Practice healthy conflict navigation", action: "activity", params: { id: "conflict-resolution" } }
  ],
  commander: [
    { title: "Empathic Leadership Quiz", description: "Balance authority with connection", action: "quiz", params: { type: "leadership" } },
    { title: "Emotional Regulation Techniques", description: "Tools for high-pressure situations", action: "activity", params: { id: "regulation" } }
  ],
};

// General activities for users without an archetype
const GENERAL_ACTIVITIES = [
  { title: "Discover Your EQ Archetype", description: "Take our assessment to get personalized coaching", action: "quiz", params: { step: "archetype" } },
  { title: "Daily Reflection Practice", description: "Build self-awareness with guided prompts", action: "activity", params: { id: "reflection" } }
];

export function SuggestedActivities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userArchetype = user?.eq_archetype as EQArchetype | undefined;
  
  // Get activities based on user's archetype or general ones if no archetype
  const getActivities = () => {
    if (userArchetype && SUGGESTED_ACTIVITIES[userArchetype]) {
      return SUGGESTED_ACTIVITIES[userArchetype];
    }
    return GENERAL_ACTIVITIES;
  };
  
  const handleActivityClick = (activity: any) => {
    // In a real app, we'd navigate to the appropriate page based on the activity type
    console.log("Activity clicked:", activity);
    if (activity.action === "quiz" && activity.params.step === "archetype") {
      navigate("/onboarding?step=archetype");
    } else {
      // For demo purposes, just show a toast or alert
      alert(`This would navigate to the ${activity.title} activity`);
    }
  };
  
  const activities = getActivities();
  const archetype = userArchetype ? ARCHETYPES[userArchetype] : null;
  
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase font-semibold text-muted-foreground">
        {archetype ? "Suggested For You" : "Get Started"}
      </h3>
      
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer border-humanly-teal/10 bg-white"
            onClick={() => handleActivityClick(activity)}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
                </div>
                {activity.action === "quiz" ? (
                  <Star className="h-4 w-4 text-humanly-teal" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-humanly-teal" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
