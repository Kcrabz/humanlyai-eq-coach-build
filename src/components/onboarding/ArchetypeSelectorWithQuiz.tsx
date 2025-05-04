
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArchetypeQuiz } from "./ArchetypeQuiz";
import { useOnboarding } from "@/context/OnboardingContext";
import { EQArchetype, CoachingMode } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ArchetypeSelectorWithQuiz = () => {
  const { state, setArchetype, completeStep } = useOnboarding();
  const [isStarted, setIsStarted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const { setOnboarded, user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const handleQuizResult = async (archetype: EQArchetype) => {
    console.log("Quiz completed, archetype received:", archetype);
    setIsProcessing(true);
    
    try {
      // Set the archetype in the onboarding context
      setArchetype(archetype);
      
      // Complete the step after setting the archetype
      await completeStep("archetype");
      
      toast.success("Profile analysis complete!");
    } catch (error) {
      console.error("Error processing quiz result:", error);
      toast.error("There was a problem saving your results. Please try again.");
    } finally {
      setIsProcessing(false);
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
                name: state.name || 'Anonymous',
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
                name: state.name || 'Anonymous',
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
            name: state.name || 'Anonymous',
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
  
  // Show initial instruction screen
  if (!isStarted) {
    return (
      <div className="max-w-lg mx-auto px-4 text-center animate-scale-fade-in">
        {/* Background blobs */}
        <div className="fixed top-40 -left-20 w-64 h-64 bg-humanly-pastel-lavender blob-animation -z-10 opacity-40 blob"></div>
        <div className="fixed bottom-20 -right-32 w-80 h-80 bg-humanly-pastel-mint blob-animation-delayed -z-10 opacity-40 blob"></div>
        
        <h1 className="text-3xl md:text-4xl font-semibold mb-8">
          EQ Assessment
        </h1>
        <p className="mb-4 text-lg">
          This quick assessment will help us understand your emotional intelligence profile and provide personalized coaching.
        </p>
        <p className="mb-10 text-muted-foreground">
          Please answer 15 questions, taking your time to reflect on each one.
        </p>
        
        <div className="relative group">
          <Button 
            size="lg" 
            onClick={() => setIsStarted(true)}
            className="py-6 px-8 text-base rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
          >
            Start Assessment
          </Button>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
        
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
        
        <div className="mt-14 bg-humanly-pastel-yellow/50 rounded-xl p-6 shadow-sm border border-humanly-pastel-yellow">
          <p className="text-gray-700 text-sm">
            Your results will help us tailor your coaching experience to match your unique emotional intelligence profile.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 animate-slide-up">
      <h1 className="text-2xl md:text-3xl font-semibold text-center mb-8">
        EQ Assessment
      </h1>
      {isProcessing ? (
        <div className="flex items-center justify-center py-16">
          <div className="space-y-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-humanly-teal mx-auto"></div>
            <p className="text-muted-foreground">Processing your results...</p>
          </div>
        </div>
      ) : (
        <ArchetypeQuiz onSelect={handleQuizResult} />
      )}
    </div>
  );
};
