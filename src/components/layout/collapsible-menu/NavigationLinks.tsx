
import { Link } from "react-router-dom";

interface NavigationLinksProps {
  handleMenuItemClick: () => void;
}

export function NavigationLinks({ handleMenuItemClick }: NavigationLinksProps) {
  return (
    <nav className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-4 md:mb-0">
      <Link 
        to="/about" 
        className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
        onClick={handleMenuItemClick}
      >
        About
      </Link>
      <Link 
        to="/pricing" 
        className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
        onClick={handleMenuItemClick}
      >
        Pricing
      </Link>
      <Link 
        to="/blog" 
        className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
        onClick={handleMenuItemClick}
      >
        Blog
      </Link>
      <Link 
        to="/help" 
        className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
        onClick={handleMenuItemClick}
      >
        Help
      </Link>
      <Link 
        to="/community" 
        className="text-sm font-medium text-foreground hover:text-humanly-teal-dark transition-colors py-2 md:py-0 border-b md:border-b-0 border-gray-100"
        onClick={handleMenuItemClick}
      >
        Community
      </Link>
    </nav>
  );
}
