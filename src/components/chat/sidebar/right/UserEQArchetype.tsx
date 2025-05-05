
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function UserEQArchetype() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user?.eq_archetype || user.eq_archetype === "Not set") return null;
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 mb-4 shadow-sm">
      <h4 className="text-sm font-medium flex items-center gap-1 text-humanly-indigo">
        Your EQ Archetype
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 w-5 p-0 rounded-full ml-auto" 
          onClick={() => navigate("/onboarding?step=archetype")}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </h4>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xl">{user.eq_archetype === "reflector" ? "🔮" : 
          user.eq_archetype === "activator" ? "⚡️" : 
          user.eq_archetype === "connector" ? "🤝" : 
          user.eq_archetype === "regulator" ? "🧘‍♂️" : 
          user.eq_archetype === "observer" ? "👁️" : "🔍"}
        </span>
        <span className="font-medium text-sm">
          {user.eq_archetype.charAt(0).toUpperCase() + user.eq_archetype.slice(1)}
        </span>
      </div>
    </div>
  );
}
