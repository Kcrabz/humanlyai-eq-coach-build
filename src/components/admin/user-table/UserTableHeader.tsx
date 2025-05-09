
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

export const UserTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Email</TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Subscription</TableHead>
        <TableHead>Archetype</TableHead>
        <TableHead>Last Login</TableHead>
        <TableHead>Chat Activity</TableHead>
        <TableHead>Token Usage</TableHead>
        <TableHead>Onboarded</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
