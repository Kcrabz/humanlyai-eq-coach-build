
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatar } from "@/lib/utils";

export function UserProfile() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-16 w-16 transition-transform duration-300 hover:scale-105">
        <AvatarImage src={user?.avatar_url || generateAvatar(user?.name || user?.email || "")} alt={user?.name || "User"} />
        <AvatarFallback>{user?.name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
      </Avatar>
      
      <div className="text-center">
        <h3 className="font-medium">{user?.name || "User"}</h3>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        {user?.subscription_tier !== "free" && (
          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-humanly-teal/10 text-humanly-teal rounded-full">
            {user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1)} Plan
          </span>
        )}
      </div>
    </div>
  );
}
