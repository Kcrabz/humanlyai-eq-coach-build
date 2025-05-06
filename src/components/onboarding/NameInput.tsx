
import { useState } from "react";
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export function NameInput() {
  const { state, setName, completeStep } = useOnboarding();
  const { firstName, lastName } = state;
  const [inputFirstName, setInputFirstName] = useState(firstName || "");
  const [inputLastName, setInputLastName] = useState(lastName || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = async () => {
    if (!inputFirstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }

    setIsProcessing(true);
    try {
      // Update the name in the onboarding context
      setName(inputFirstName.trim(), inputLastName.trim());
      await completeStep("name");
      toast.success("Name saved successfully");
    } catch (error) {
      console.error("Error saving name:", error);
      toast.error("Failed to save your name");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 text-center animate-scale-fade-in">
      {/* Background blobs */}
      <div className="fixed top-40 -left-20 w-64 h-64 bg-humanly-pastel-blue blob-animation -z-10 opacity-40 blob"></div>
      <div className="fixed bottom-20 -right-32 w-80 h-80 bg-humanly-pastel-yellow blob-animation-delayed -z-10 opacity-40 blob"></div>
      
      <h1 className="text-3xl md:text-4xl font-semibold mb-8">
        What's your name?
      </h1>
      <p className="mb-10 text-lg">
        We'll use this to personalize your coaching experience.
      </p>
      
      <div className="mb-8 space-y-4 max-w-xs mx-auto">
        <div>
          <Label htmlFor="firstName" className="text-left block mb-2">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={inputFirstName}
            onChange={(e) => setInputFirstName(e.target.value)}
            className="text-lg py-6"
            autoFocus
          />
        </div>
        
        <div>
          <Label htmlFor="lastName" className="text-left block mb-2">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={inputLastName}
            onChange={(e) => setInputLastName(e.target.value)}
            className="text-lg py-6"
          />
        </div>
      </div>
      
      <div className="relative group">
        <Button 
          onClick={handleContinue} 
          disabled={isProcessing || !inputFirstName.trim()}
          className="py-6 px-8 text-base rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] bg-gradient-to-r from-humanly-teal to-humanly-teal/90"
        >
          {isProcessing ? "Saving..." : "Continue"}
        </Button>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-humanly-teal/20 to-humanly-green/20 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
      </div>
    </div>
  );
}
