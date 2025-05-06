
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { 
  generateTOTPSecret, 
  verifyTOTPCode, 
  enableTwoFactor, 
  disableTwoFactor, 
  isTwoFactorEnabled 
} from "@/services/twoFactorService";
import { Shield, ShieldAlert, Smartphone, Copy, CheckCircle } from "lucide-react";

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totpSecret, setTotpSecret] = useState<{
    secret: string;
    qrCode: string;
    recoveryCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryCodesDialogOpen, setRecoveryCodesDialogOpen] = useState(false);
  
  // Load the current 2FA status when component mounts
  useEffect(() => {
    const loadTwoFactorStatus = async () => {
      if (user?.id) {
        setIsLoading(true);
        const enabled = await isTwoFactorEnabled(user.id);
        setIsEnabled(enabled);
        setIsLoading(false);
      }
    };
    
    loadTwoFactorStatus();
  }, [user?.id]);
  
  const handleSetupStart = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    const secret = await generateTOTPSecret(user.id);
    
    if (secret) {
      setTotpSecret(secret);
      setIsSetupOpen(true);
      setCurrentStep(1);
    } else {
      toast.error("Failed to generate security code");
    }
    
    setIsLoading(false);
  };
  
  const handleVerifyCode = async () => {
    if (!user?.id || !verificationCode) return;
    
    setIsLoading(true);
    
    const isValid = await verifyTOTPCode(user.id, verificationCode);
    
    if (isValid) {
      // Enable 2FA for the user
      const success = await enableTwoFactor(user.id);
      
      if (success) {
        setCurrentStep(3);
        setIsEnabled(true);
      } else {
        toast.error("Failed to enable two-factor authentication");
      }
    } else {
      toast.error("Invalid verification code. Please try again.");
    }
    
    setIsLoading(false);
  };
  
  const handleDisable = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    
    const success = await disableTwoFactor(user.id);
    
    if (success) {
      setIsEnabled(false);
    }
    
    setIsLoading(false);
  };
  
  const handleCopyRecoveryCodes = () => {
    if (!totpSecret?.recoveryCodes) return;
    
    const codes = totpSecret.recoveryCodes.join('\n');
    navigator.clipboard.writeText(codes);
    toast.success("Recovery codes copied to clipboard");
  };
  
  const handleCloseSetup = () => {
    setIsSetupOpen(false);
    setVerificationCode("");
    
    // If we were in the final step, show the recovery codes
    if (currentStep === 3) {
      setRecoveryCodesDialogOpen(true);
    }
  };
  
  const handleManageRecoveryCodes = () => {
    setRecoveryCodesDialogOpen(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-humanly-teal" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Secure your account with two-factor authentication
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isEnabled ? (
          <div className="bg-green-50 p-4 rounded-md flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-800">Two-factor authentication is enabled</p>
              <p className="text-sm text-green-700 mt-1">
                Your account has an extra layer of security. When you log in, you'll need to provide
                a verification code from your authentication app.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-md flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Two-factor authentication is not enabled</p>
              <p className="text-sm text-yellow-700 mt-1">
                Add additional security to your account by enabling two-factor authentication.
                When two-factor authentication is enabled, you'll be required to provide a verification
                code during login.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {isEnabled ? (
          <Button 
            variant="destructive" 
            onClick={handleDisable} 
            disabled={isLoading}
          >
            {isLoading ? "Disabling..." : "Disable 2FA"}
          </Button>
        ) : (
          <Button 
            onClick={handleSetupStart} 
            disabled={isLoading}
            className="bg-humanly-teal hover:bg-humanly-teal-dark"
          >
            {isLoading ? "Loading..." : "Set Up 2FA"}
          </Button>
        )}
        
        {isEnabled && (
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={handleManageRecoveryCodes}
          >
            Manage Recovery Codes
          </Button>
        )}
      </CardFooter>
      
      {/* 2FA Setup Dialog */}
      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentStep === 1 && "Set up two-factor authentication"}
              {currentStep === 2 && "Verify your authentication app"}
              {currentStep === 3 && "Two-factor authentication enabled"}
            </DialogTitle>
            <DialogDescription>
              {currentStep === 1 && "Scan the QR code with your authentication app"}
              {currentStep === 2 && "Enter the 6-digit code from your authentication app"}
              {currentStep === 3 && "Your account is now more secure"}
            </DialogDescription>
          </DialogHeader>
          
          {currentStep === 1 && totpSecret && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={totpSecret.qrCode} 
                  alt="QR Code for 2FA" 
                  className="w-48 h-48 bg-white p-2 rounded"
                />
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p className="font-semibold mb-1">Or enter this code manually:</p>
                <code className="bg-muted p-1 rounded">{totpSecret.secret}</code>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                <p className="font-semibold">Important:</p>
                <p>
                  Scan this QR code with an authenticator app like Google Authenticator,
                  Authy, or Microsoft Authenticator.
                </p>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center">
                <Smartphone className="mr-2 h-5 w-5 text-humanly-teal" />
                <Label htmlFor="verification-code">Verification Code</Label>
              </div>
              <Input
                id="verification-code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authentication app to verify it's working correctly.
              </p>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="text-center py-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-lg font-medium">Two-factor authentication enabled!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your account is now protected with an additional layer of security.
              </p>
            </div>
          )}
          
          <DialogFooter className="sm:justify-between mt-4">
            {currentStep === 1 && (
              <>
                <Button variant="outline" onClick={handleCloseSetup}>
                  Cancel
                </Button>
                <Button onClick={() => setCurrentStep(2)}>
                  Continue
                </Button>
              </>
            )}
            
            {currentStep === 2 && (
              <>
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={verificationCode.length !== 6 || isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </Button>
              </>
            )}
            
            {currentStep === 3 && (
              <Button onClick={handleCloseSetup} className="w-full">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Recovery Codes Dialog */}
      <Dialog open={recoveryCodesDialogOpen} onOpenChange={setRecoveryCodesDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recovery Codes</DialogTitle>
            <DialogDescription>
              Keep these recovery codes in a secure place. You can use them to regain access to your account if you lose your authentication device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md font-mono text-sm">
              {totpSecret?.recoveryCodes ? (
                <div className="grid grid-cols-2 gap-2">
                  {totpSecret.recoveryCodes.map((code, index) => (
                    <div key={index} className="p-1">{code}</div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No recovery codes available</p>
              )}
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
              <p className="font-semibold">Warning:</p>
              <p>
                Each code can only be used once. When you've used all your codes, you can generate new ones in settings. If you can't access your codes, you'll need to contact support.
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCopyRecoveryCodes}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Codes
            </Button>
            <Button className="flex-1" onClick={() => setRecoveryCodesDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
