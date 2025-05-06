
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useState } from 'react';

export const useReCaptcha = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isVerifying, setIsVerifying] = useState(false);
  
  const verifyRecaptcha = async (): Promise<string | null> => {
    if (!executeRecaptcha) {
      console.error('ReCaptcha not initialized');
      return null;
    }
    
    setIsVerifying(true);
    
    try {
      const token = await executeRecaptcha('signup');
      return token;
    } catch (error) {
      console.error('ReCaptcha verification failed:', error);
      return null;
    } finally {
      setIsVerifying(false);
    }
  };
  
  return { verifyRecaptcha, isVerifying };
};
