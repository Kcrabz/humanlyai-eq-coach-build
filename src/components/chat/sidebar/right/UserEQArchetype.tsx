
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ARCHETYPES } from "@/lib/constants";
import { EQArchetype } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UserEQArchetype() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  
  if (!user?.eq_archetype || user.eq_archetype === "Not set") return null;
  
  const archetype = ARCHETYPES[user.eq_archetype as EQArchetype];
  
  return (
    <>
      <div 
        className="bg-white rounded-lg border border-gray-100 p-3 mb-4 shadow-sm transition-all hover:shadow-md hover:border-humanly-pastel-lavender/60 cursor-pointer"
        onClick={() => setShowDetails(true)}
        role="button"
        aria-label="View archetype details"
      >
        <h4 className="text-sm font-medium flex items-center gap-1 text-humanly-indigo">
          Your EQ Archetype
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0 rounded-full ml-auto" 
            onClick={(e) => {
              e.stopPropagation();
              navigate("/onboarding?step=archetype");
            }}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xl">{archetype.icon}</span>
          <span className="font-medium text-sm">
            {user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Archetype details dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-xl">{archetype.icon}</span>
              <span>
                {user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)} Archetype
              </span>
            </DialogTitle>
            <DialogDescription className="pt-2">
              {archetype.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Your Strengths:</h3>
              <ul className="space-y-2">
                {archetype.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Growth Areas:</h3>
              <ul className="space-y-2">
                {archetype.growthAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      →
                    </div>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {archetype.microPractice && (
              <div className="bg-humanly-pastel-lavender/20 p-3 rounded-md">
                <h3 className="text-sm font-medium mb-1">Try This Today:</h3>
                <p className="text-sm">{archetype.microPractice}</p>
              </div>
            )}
            
            <div className="flex justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDetails(false)}
                className="mr-2"
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setShowDetails(false);
                  navigate("/progress");
                }}
              >
                View Full Journey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
