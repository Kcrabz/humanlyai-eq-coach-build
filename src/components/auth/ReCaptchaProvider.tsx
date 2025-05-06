
import React from 'react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  // This is a public site key specific for localhost - replace with your own for production
  const recaptchaSiteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={recaptchaSiteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
