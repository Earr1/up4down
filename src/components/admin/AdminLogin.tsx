import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (resetMode) {
        // Handle password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/admin`,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Password reset link sent to your email");
          setResetMode(false);
        }
        setLoading(false);
        return;
      }

      // Validate inputs
      const validation = loginSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      // Sign in (session persistence is handled by Supabase client config)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Login successful");
    } catch (error) {
      toast.error("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-accent" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          {resetMode ? "Reset Password" : "Admin Login"}
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          {resetMode 
            ? "Enter your email to receive a password reset link" 
            : "Sign in to access the admin panel"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          {!resetMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                  Remember me for 30 days
                </Label>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Processing..." : (resetMode ? "Send Reset Link" : "Login")}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setResetMode(!resetMode)}
          >
            {resetMode ? "Back to Login" : "Forgot Password?"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
