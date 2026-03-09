import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

type AppRole = "admin" | "vciso" | "soc_analyst";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="cyberx-grid-bg min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="cyberx-grid-bg min-h-screen flex items-center justify-center p-4">
        <div className="cyberx-panel p-8 text-center space-y-4">
          <h1 className="font-display text-xl text-destructive">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            Your role ({role}) does not have access to this area.
          </p>
          <p className="text-xs text-muted-foreground">
            Required roles: {allowedRoles.join(", ")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
