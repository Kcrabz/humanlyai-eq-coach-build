
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface UnauthenticatedActionsProps {
  handleMenuItemClick: () => void;
}

export function UnauthenticatedActions({ handleMenuItemClick }: UnauthenticatedActionsProps) {
  return (
    <>
      <Link 
        to="/login"
        onClick={handleMenuItemClick}
        className="w-full md:w-auto"
      >
        <Button variant="outline" size="sm" className="rounded-lg transition-all duration-300 hover:bg-humanly-pastel-blue/30 border-humanly-teal/20 w-full md:w-auto">
          Sign In
        </Button>
      </Link>
      <Link 
        to="/signup"
        onClick={handleMenuItemClick}
        className="w-full md:w-auto"
      >
        <Button size="sm" className="rounded-lg bg-gradient-to-r from-humanly-teal to-humanly-teal/90 transition-all duration-300 hover:shadow-md hover:scale-105 w-full md:w-auto">
          Get Started
        </Button>
      </Link>
    </>
  );
}
