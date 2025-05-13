
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Key, Eye, EyeOff } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/auth/password/PasswordStrengthIndicator";

export default function PasswordChanger() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: false,
    feedback: "Enter a new password",
    strength: 'weak' as 'weak' | 'medium' | 'strong'
  });
  
  // Check password strength
  const checkPasswordStrength = (password: string) => {
    // Basic strength checks
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    let feedback = "";
    let isValid = false;
    
    if (!password) {
      feedback = "Enter a new password";
    } else if (password.length < 8) {
      feedback = "Password is too short";
    } else if (!hasLetter || !hasNumber) {
      feedback = "Add both letters and numbers";
      strength = 'weak';
    } else if (!hasSpecial) {
      feedback = "Good password, add a special character for stronger security";
      strength = 'medium';
      isValid = true;
    } else {
      feedback = "Strong password";
      strength = 'strong';
      isValid = true;
    }
    
    setPasswordStrength({
      isValid,
      feedback,
      strength
    });
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (!passwordStrength.isValid) {
      toast.error("Please choose a stronger password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: await getCurrentUserEmail(),
        password: currentPassword,
      });
      
      if (signInError) {
        toast.error("Current password is incorrect");
        return;
      }
      
      // Update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Password updated successfully");
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
    } catch (error) {
      console.error("Failed to update password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get current user's email
  const getCurrentUserEmail = async (): Promise<string> => {
    const { data } = await supabase.auth.getUser();
    return data.user?.email || "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-humanly-teal" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  checkPasswordStrength(e.target.value);
                }}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <PasswordStrengthIndicator 
              password={newPassword} 
              passwordStrength={passwordStrength} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-500">Passwords don't match</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !passwordStrength.isValid || newPassword !== confirmPassword}
            className="w-full mt-4"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
