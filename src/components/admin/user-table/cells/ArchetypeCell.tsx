
import { Badge } from "@/components/ui/badge";
import { UserTableCellProps } from "../types";
import { getArchetypeVariant } from "../utils";

export const ArchetypeCell = ({ user }: UserTableCellProps) => {
  const archetype = user.eq_archetype || "Not set";
  
  return (
    <Badge 
      variant={getArchetypeVariant(archetype)}
    >
      {archetype}
    </Badge>
  );
};
