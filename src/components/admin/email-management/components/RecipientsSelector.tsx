
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  email: string;
}

interface RecipientsSelectorProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: User[];
  selectedUsers: string[];
  handleUserToggle: (userId: string) => void;
  handleSelectAll: () => void;
}

export const RecipientsSelector: React.FC<RecipientsSelectorProps> = ({
  searchTerm,
  setSearchTerm,
  filteredUsers,
  selectedUsers,
  handleUserToggle,
  handleSelectAll
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium">Select Recipients</label>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="selectAll" 
            checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="selectAll" className="text-xs font-medium">Select All</label>
        </div>
      </div>
      
      <Input
        placeholder="Search users by email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-2"
      />
      
      <div className="border rounded-md h-64 overflow-y-auto p-2">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No users found
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center space-x-2 py-1 hover:bg-muted px-2 rounded-sm">
              <Checkbox
                id={`user-${user.id}`}
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={() => handleUserToggle(user.id)}
              />
              <label htmlFor={`user-${user.id}`} className="text-sm flex-grow cursor-pointer">
                {user.email}
              </label>
            </div>
          ))
        )}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Selected {selectedUsers.length} of {filteredUsers.length} users
      </div>
    </div>
  );
};
