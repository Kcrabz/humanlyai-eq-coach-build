
import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

interface MemoryClearActionsProps {
  onClearMemories: (shouldArchive: boolean) => Promise<void>;
}

export const MemoryClearActions = ({ onClearMemories }: MemoryClearActionsProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Archive className="h-4 w-4 mr-2" />
            Archive & Clear
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive and clear all memories?</DialogTitle>
            <DialogDescription>
              This will archive your memories and then clear them. You can access archived memories later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {}}>Cancel</Button>
            <Button 
              variant="default"
              onClick={() => onClearMemories(true)}
            >
              Archive & Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Only
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all memories?</DialogTitle>
            <DialogDescription>
              This will permanently delete all conversation memories without archiving and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {}}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={() => onClearMemories(false)}
            >
              Delete All Memories
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
