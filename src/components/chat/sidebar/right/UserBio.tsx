
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function UserBio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!user?.bio) return null;
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-3 shadow-sm">
      <h4 className="text-sm font-medium flex items-center gap-1 text-humanly-indigo">
        Your Bio
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 w-5 p-0 rounded-full ml-auto" 
          onClick={() => navigate("/settings")}
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </h4>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
        {user.bio}
      </p>
    </div>
  );
}
