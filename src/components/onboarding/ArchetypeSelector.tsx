
import { ARCHETYPES } from "@/lib/constants";
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { EQArchetype } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ArchetypeSelector() {
  const { state, setArchetype, completeStep } = useOnboarding();
  const { archetype: selectedArchetype } = state;

  const handleContinue = () => {
    if (selectedArchetype) {
      completeStep("archetype");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-scale-fade-in">
      {/* Background blobs */}
      <div className="fixed top-20 -left-32 w-64 h-64 bg-humanly-pastel-peach blob-animation -z-10 opacity-40 blob"></div>
      <div className="fixed bottom-20 -right-20 w-80 h-80 bg-humanly-pastel-blue blob-animation-delayed -z-10 opacity-40 blob"></div>
      
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-semibold">Discover Your EQ Archetype</h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
          Select the profile that best matches your emotional intelligence style.
          This helps us personalize your coaching experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(ARCHETYPES).map((archetype) => (
          <Card 
            key={archetype.type}
            className={cn(
              "cursor-pointer border-2 transition-all duration-300 selection-card overflow-hidden rounded-xl",
              selectedArchetype === archetype.type
                ? "border-humanly-teal bg-gradient-to-br from-white to-humanly-gray-lightest shadow-soft selected"
                : "border-border hover:border-humanly-teal/30 hover:shadow-soft card-hover"
            )}
            onClick={() => setArchetype(archetype.type as EQArchetype)}
          >
            <CardHeader className="pb-2">
              <div className="text-3xl mb-3">{archetype.icon}</div>
              <CardTitle className="text-xl md:text-2xl">{archetype.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {archetype.description}
              </p>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="w-full">
                <p className="text-xs font-medium mb-2">Strengths:</p>
                <div className="flex flex-wrap gap-1.5">
                  {archetype.strengths.map((strength) => (
                    <span 
                      key={strength} 
                      className={cn(
                        "px-2 py-1 text-xs rounded-full transition-colors duration-300",
                        selectedArchetype === archetype.type 
                          ? "bg-humanly-teal text-white" 
                          : "bg-humanly-teal/10 text-humanly-teal"
                      )}
                    >
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center mt-10">
        <div className="relative group">
          <Button 
            onClick={handleContinue} 
            disabled={!selectedArchetype}
            className="py-6 px-8 text-base rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
          >
            Continue
          </Button>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
}
