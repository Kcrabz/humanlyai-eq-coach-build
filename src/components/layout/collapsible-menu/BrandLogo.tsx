
import { Link } from "react-router-dom";

interface BrandLogoProps {
  handleMenuItemClick: () => void;
}

export function BrandLogo({ handleMenuItemClick }: BrandLogoProps) {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02] mb-4 md:mb-0"
      onClick={handleMenuItemClick}
    >
      <span className="bg-gradient-to-r from-humanly-teal to-humanly-teal-light bg-clip-text text-transparent text-2xl font-bold">
        HumanlyAI
      </span>
    </Link>
  );
}
