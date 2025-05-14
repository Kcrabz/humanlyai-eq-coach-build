
import { Link } from "react-router-dom";
import { User } from "@/types";

interface MobileUserOptionsProps {
  user: User | null;
  isAdmin: boolean;
  handleMenuItemClick: () => void;
  logout: () => void;
}

export function MobileUserOptions({ user, isAdmin, handleMenuItemClick, logout }: MobileUserOptionsProps) {
  return (
    <div className="flex flex-col w-full mt-4 md:hidden overflow-y-auto max-h-[60vh] pb-4">
      <Link 
        to="/progress"
        onClick={handleMenuItemClick}
        className="p-3 text-sm hover:bg-gray-100 rounded-md"
      >
        Your Progress
      </Link>
      <Link 
        to="/settings"
        onClick={handleMenuItemClick}
        className="p-3 text-sm hover:bg-gray-100 rounded-md"
      >
        Settings
      </Link>
      <Link 
        to="/subscription"
        onClick={handleMenuItemClick}
        className="p-3 text-sm hover:bg-gray-100 rounded-md"
      >
        Subscription
      </Link>
      
      {/* Admin link - only visible for admin users - removed icon */}
      {isAdmin && (
        <Link 
          to="/admin" 
          onClick={handleMenuItemClick}
          className="p-3 text-sm hover:bg-gray-100 rounded-md"
        >
          Admin Dashboard
        </Link>
      )}
      
      {/* Refer a Friend link - removed icon */}
      <Link 
        to="/refer" 
        onClick={handleMenuItemClick}
        className="p-3 text-sm hover:bg-gray-100 rounded-md"
      >
        Refer a Friend
      </Link>
      
      <button 
        onClick={() => {
          logout();
          handleMenuItemClick();
        }}
        className="p-3 text-sm text-left text-red-500 hover:bg-red-50 rounded-md mt-2"
      >
        Log out
      </button>
    </div>
  );
}
