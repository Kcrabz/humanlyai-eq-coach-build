
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpdateNotificationProps {
  reloadPage: () => void;
}

export function UpdateNotification({ reloadPage }: UpdateNotificationProps) {
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  
  useEffect(() => {
    // Listen for update events from the service worker
    const updateHandler = () => {
      setShowUpdateNotification(true);
      
      toast.info(
        <div className="flex flex-col gap-2">
          <p>A new version is available!</p>
          <Button 
            size="sm" 
            className="bg-humanly-indigo"
            onClick={() => {
              reloadPage();
              setShowUpdateNotification(false);
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Now
          </Button>
        </div>,
        {
          duration: Infinity,
          id: 'pwa-update',
        }
      );
    };
    
    window.addEventListener('pwa-update-available', updateHandler);
    
    return () => {
      window.removeEventListener('pwa-update-available', updateHandler);
    };
  }, [reloadPage]);
  
  return null; // This component doesn't render anything itself, it just shows a toast
}
