
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailPasswordFieldsProps {
  email: string;
  password: string;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isRateLimited: boolean;
}

export function EmailPasswordFields({
  email,
  password,
  handleEmailChange,
  handlePasswordChange,
  isSubmitting,
  isRateLimited
}: EmailPasswordFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={handleEmailChange}
          disabled={isSubmitting || isRateLimited}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link 
            to="/reset-password"
            className="text-sm text-humanly-teal hover:text-humanly-teal-dark"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          disabled={isSubmitting || isRateLimited}
          required
        />
      </div>
    </>
  );
}
