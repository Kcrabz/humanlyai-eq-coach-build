
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function Loading({ size = "medium", className }: LoadingProps) {
  const sizeStyles = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4"
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={cn(
          "animate-spin rounded-full border-humanly-purple-light border-solid border-t-transparent",
          sizeStyles[size],
          className
        )}
      />
    </div>
  );
}
