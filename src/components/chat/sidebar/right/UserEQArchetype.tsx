
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
        className="bg-humanly-pastel-lavender/30 rounded-lg p-3 mb-4 cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-humanly-indigo flex items-center justify-center text-white font-medium">
            {user.eq_archetype.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-sm">{user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}</h3>
            <p className="text-xs text-gray-500">EQ Archetype</p>
          </div>
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
