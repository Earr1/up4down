import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

export const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simple password check against database
      const { data, error } = await supabase
        .from("admin_users")
        .select("password_hash")
        .eq("username", "admin")
        .single();

      if (error || !data) {
        toast.error("Authentication failed");
        setLoading(false);
        return;
      }

      // Simple password comparison (in production, use proper hashing)
      if (data.password_hash === password) {
        toast.success("Login successful");
        onLogin(true);
      } else {
        toast.error("Invalid password");
      }
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

        <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
        <p className="text-muted-foreground text-center mb-6">
          Enter your password to access the admin panel
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-accent hover:bg-accent/90"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
};
