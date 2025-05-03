
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/context/OnboardingContext";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EQArchetype, CoachingMode } from "@/types";

export function GoalSelector() {
  const [goal, setGoal] = useState("");
  const [isSetting, setIsSetting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const { state, setGoal: updateGoal, completeStep } = useOnboarding();
  const { setOnboarded, user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!goal.trim()) {
      return;
    }

    setIsSetting(true);
    try {
      updateGoal(goal);
      await completeStep("goal");
    } finally {
      setIsSetting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      // Create or update profile with default values
      if (user?.id) {
        try {
          console.log("Checking for existing profile for user:", user.id);
          // Check if profile already exists
          const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
          if (fetchError) {
            console.error("Error checking for existing profile:", fetchError.message);
            throw fetchError;
          }
          
          if (!existingProfile) {
            // Create profile if it doesn't exist yet
            console.log("Creating default profile for user:", user.id);
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                subscription_tier: 'free',
                eq_archetype: 'Not set' as EQArchetype,
                coaching_mode: 'normal' as CoachingMode,
                onboarded: true
              });
              
            if (insertError) {
              console.error("Error creating profile:", insertError);
              throw insertError;
            }
            
            console.log("Successfully created default profile");
          } else {
            // Update existing profile
            console.log("Updating existing profile for user:", user.id);
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                onboarded: true,
                eq_archetype: 'Not set' as EQArchetype,
                coaching_mode: 'normal' as CoachingMode,
              })
              .eq('id', user.id);
              
            if (updateError) {
              console.error("Failed to update onboarding status:", updateError);
              throw updateError;
            }
            
            console.log("Successfully updated profile");
          }
        } catch (error: any) {
          console.error("Database operation failed:", error.message || error);
          toast.error("Could not update your profile. Please try again.");
          setIsSkipping(false);
          return;
        }
        
        // Update local user state
        setUser(prevUser => {
          if (!prevUser) return null;
          return { 
            ...prevUser, 
            onboarded: true,
            eq_archetype: 'Not set' as EQArchetype,
            coaching_mode: 'normal' as CoachingMode
          };
        });
      } else {
        console.error("No user ID available");
        toast.error("User information not available. Please try again or log out and back in.");
        setIsSkipping(false);
        return;
      }

      // Mark user as onboarded in both database and local state
      await setOnboarded(true);
      toast.success("Welcome to Humanly Chat");
      // Navigate to chat page
      navigate("/chat", { replace: true });
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      toast.error("Failed to skip onboarding. Please try again.");
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 animate-scale-fade-in">
      {/* Background blobs */}
      <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-peach blob-animation -z-10 opacity-40 blob"></div>
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-40 blob"></div>
      
      <h1 className="text-3xl md:text-4xl font-semibold mb-6 text-center leading-tight">
        What's your main goal with <span className="text-humanly-teal">emotional intelligence</span> coaching?
      </h1>
      
      <div className="space-y-6 mt-10">
        <div className="relative group">
          <Input
            placeholder="e.g., Improve my relationships, manage stress better..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full py-6 px-5 text-base shadow-sm bg-white transition-all duration-300 input-focus-animation rounded-xl"
            autoFocus
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
        
        <Button 
          onClick={handleNext}
          disabled={!goal.trim() || isSetting}
          className="w-full py-6 rounded-xl text-base shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
        >
          {isSetting ? "Setting goal..." : "Continue"}
        </Button>
        
        <div className="text-center mt-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  className="bg-transparent text-gray-500 hover:bg-gray-50 border-gray-200 hover:text-gray-700 transition-all duration-300"
                  onClick={handleSkip}
                  disabled={isSkipping}
                >
                  {isSkipping ? "Redirecting..." : "Skip straight to chatting"}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white shadow-soft">
                <p>You can complete your EQ assessment later in settings.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="text-xs text-muted-foreground mt-2">
            You can complete your EQ assessment later in settings.
          </p>
        </div>
      </div>
    </div>
  );
}
