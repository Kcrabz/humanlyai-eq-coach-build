
import { Badge } from "@/components/ui/badge";
import { UserTableCellProps } from "../types";
import { getBadgeVariant } from "../utils";
import { SubscriptionTier } from "@/types";

export const SubscriptionCell = ({ user }: UserTableCellProps) => {
  return (
    <Badge 
      variant={getBadgeVariant(user.subscription_tier)}
    >
      {user.subscription_tier || "free"}
    </Badge>
  );
};
