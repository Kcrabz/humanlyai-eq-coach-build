
import { useState, useEffect } from 'react';
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
    };
    
    window.addEventListener('pwa-update-available', updateHandler);
    
    return () => {
      window.removeEventListener('pwa-update-available', updateHandler);
    };
  }, [reloadPage]);
  
  if (!showUpdateNotification) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-humanly-indigo text-white p-4 rounded-lg shadow-lg z-50 flex flex-col gap-2">
      <p>A new version is available!</p>
      <Button 
        size="sm" 
        variant="outline"
        className="bg-white text-humanly-indigo hover:bg-gray-100"
        onClick={() => {
          reloadPage();
          setShowUpdateNotification(false);
        }}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Update Now
      </Button>
    </div>
  );
}
