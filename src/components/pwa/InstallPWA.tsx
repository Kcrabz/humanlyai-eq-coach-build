
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  // Check if app is already installed as PWA
  useEffect(() => {
    // Check if the app is in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsPWA(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Add event listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      toast.success('Installation started!');
    } else {
      toast.info('You can install the app later from the menu');
    }
    
    // We no longer need the prompt. Clear it and hide the button.
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (isPWA || !isInstallable) {
    return null;
  }

  return (
    <Button 
      onClick={handleInstallClick} 
      size="sm" 
      className="rounded-full gap-2 bg-gradient-to-r from-humanly-indigo to-humanly-teal text-white hover:opacity-90"
    >
      <Download size={16} />
      Install App
    </Button>
  );
}
