import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Shield, Loader2 } from "lucide-react";

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created! You can now sign in.");
          navigate("/advisors/dashboard");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          navigate("/advisors/dashboard");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cyberx-grid-bg min-h-screen flex items-center justify-center p-4">
      <div className="cyberx-panel w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-primary/20 border border-primary/40">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl text-foreground">CyberX Advisors</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Create your security operations account" : "Sign in to your security operations center"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="bg-secondary/60 border-border/80"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@cyberx.io"
              required
              className="bg-secondary/60 border-border/80"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-secondary/60 border-border/80"
            />
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
          </button>
        </div>

        <div className="pt-4 border-t border-border/40">
          <p className="text-[10px] text-center text-muted-foreground">
            Default role: SOC Analyst • Contact admin for role upgrades
          </p>
        </div>
      </div>
    </div>
  );
}
