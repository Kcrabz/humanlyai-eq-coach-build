
import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast.success("You're back online!");
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("You're offline. Some features may be limited.", {
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-md flex items-center gap-2 shadow-md z-50">
      <WifiOff size={16} />
      <span className="text-sm font-medium">Offline Mode</span>
    </div>
  );
}
