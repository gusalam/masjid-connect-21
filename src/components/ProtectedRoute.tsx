import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requireApproval?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, requireApproval = true }: ProtectedRouteProps) {
  const { user, role, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // No role assigned
    if (!role) {
      navigate('/login', { replace: true });
      return;
    }

    // Role not allowed for this route
    if (!allowedRoles.includes(role)) {
      // Redirect to correct dashboard based on role
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'bendahara') {
        navigate('/bendahara/dashboard', { replace: true });
      } else if (role === 'jamaah') {
        navigate('/jamaah/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
      return;
    }

    // For jamaah, check approval status
    if (requireApproval && role === 'jamaah') {
      const userStatus = profile?.status || 'pending';
      if (userStatus !== 'approved') {
        signOut();
        navigate('/login', { replace: true });
        return;
      }
    }
  }, [user, role, profile, loading, allowedRoles, requireApproval, navigate, signOut]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Not authorized yet
  if (!user || !role) {
    return null;
  }

  // Role not allowed
  if (!allowedRoles.includes(role)) {
    return null;
  }

  // Jamaah not approved
  if (requireApproval && role === 'jamaah' && profile?.status !== 'approved') {
    return null;
  }

  return <>{children}</>;
}
