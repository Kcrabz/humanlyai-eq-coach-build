
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AvatarGridProps {
  avatars: Array<{
    seed: string;
    url?: string;
    features?: {
      gender?: string;
      accessories?: string[];
      style?: string;
    };
  }>;
  selectedAvatar: string;
  onSelectAvatar: (url: string) => void;
  showFeatureBadges?: boolean;
}

const AvatarGrid: React.FC<AvatarGridProps> = ({
  avatars,
  selectedAvatar,
  onSelectAvatar,
  showFeatureBadges = false,
}) => {
  if (avatars.length === 0) {
    return (
      <div className="col-span-full p-4 text-center text-muted-foreground">
        No avatars found matching your search criteria
      </div>
    );
  }

  return (
    <div className={`grid ${showFeatureBadges ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3" : "grid-cols-3 gap-2 sm:grid-cols-6"}`}>
      {avatars.map((avatar, index) => {
        const avatarUrl = avatar.url || avatar.seed;
        return showFeatureBadges ? (
          <div
            key={index}
            className={`flex flex-col items-center gap-1 cursor-pointer p-2 rounded-md transition-all ${
              selectedAvatar === avatarUrl
                ? "bg-primary/10 ring-2 ring-primary"
                : "hover:bg-accent"
            }`}
            onClick={() => onSelectAvatar(avatarUrl)}
          >
            <Avatar className="h-16 w-16 mb-1">
              <AvatarImage src={avatarUrl} alt={`Avatar ${avatar.seed}`} />
              <AvatarFallback>
                <UserRound className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-center truncate w-full font-medium">
              {avatar.seed}
            </span>
            {avatar.features && (
              <div className="flex flex-wrap justify-center gap-1">
                {avatar.features.gender && (
                  <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4">
                    {avatar.features.gender}
                  </Badge>
                )}
                {avatar.features.accessories?.includes('glasses') && (
                  <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4">
                    glasses
                  </Badge>
                )}
                {avatar.features.accessories?.includes('beard') && (
                  <Badge variant="outline" className="text-[0.6rem] px-1 py-0 h-4">
                    beard
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            key={index}
            className={`rounded-md p-1 transition-all ${
              selectedAvatar === avatarUrl
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:ring-2 hover:ring-muted"
            }`}
            onClick={() => onSelectAvatar(avatarUrl)}
          >
            <Avatar>
              <AvatarImage src={avatarUrl} alt={`Avatar option ${index + 1}`} />
              <AvatarFallback>
                <UserRound className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </button>
        );
      })}
    </div>
  );
};

export default AvatarGrid;
