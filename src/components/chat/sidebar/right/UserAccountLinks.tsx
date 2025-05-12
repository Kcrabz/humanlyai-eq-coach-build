
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  UserCircle, 
  CreditCard, 
  MemoryStick,
  Bell
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { MemorySettings } from "@/components/chat/memory/MemorySettings";

export function UserAccountLinks() {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-medium mb-2">Your account</h3>
      
      <div className="space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/settings">
            <UserCircle className="h-4 w-4 mr-2" />
            Profile
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/settings?tab=preferences">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Link>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/settings?tab=notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-sm"
          asChild
        >
          <Link to="/settings?tab=billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Subscription
          </Link>
        </Button>
        
        {/* Memory Button with Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm"
            >
              <MemoryStick className="h-4 w-4 mr-2" />
              Memory
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Memory Settings</DialogTitle>
            </DialogHeader>
            <MemorySettings />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
