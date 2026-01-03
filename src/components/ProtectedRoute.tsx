import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requireApproval?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, requireApproval = true }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('[PROTECTED] Checking user:', user?.id);
      
      if (!user) {
        console.log('[PROTECTED] No user, redirecting to login');
        navigate('/login');
        return;
      }

      // Get user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      console.log('[PROTECTED] Role data:', roleData, 'Error:', roleError);

      if (!roleData || roleError) {
        console.log('[PROTECTED] No role found, redirecting to login');
        navigate('/login');
        return;
      }

      const userRole = roleData.role;
      console.log('[PROTECTED] User role:', userRole, 'Allowed roles:', allowedRoles);

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        console.log('[PROTECTED] Role not allowed, redirecting based on role');
        // Redirect based on actual role
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'bendahara') {
          navigate('/bendahara/dashboard', { replace: true });
        } else if (userRole === 'jamaah') {
          navigate('/jamaah/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
        return;
      }

      // For jamaah, check approval status if required
      if (requireApproval && userRole === 'jamaah') {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        console.log('[PROTECTED] Profile data:', profileData, 'Error:', profileError);

        const userStatus = profileData?.status || 'pending';
        console.log('[PROTECTED] Jamaah status:', userStatus);

        if (userStatus !== 'approved') {
          console.log('[PROTECTED] Jamaah not approved, signing out');
          await supabase.auth.signOut();
          navigate('/login', { replace: true });
          return;
        }
      }

      console.log('[PROTECTED] Authorization successful');
      setAuthorized(true);
    } catch (error) {
      console.error('[PROTECTED] Auth check error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

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

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
