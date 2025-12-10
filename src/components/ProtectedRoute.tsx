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
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Check user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!roleData || !allowedRoles.includes(roleData.role)) {
        // Redirect based on role
        if (roleData?.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (roleData?.role === 'bendahara') {
          navigate('/bendahara/dashboard');
        } else if (roleData?.role === 'jamaah') {
          navigate('/jamaah/dashboard');
        } else {
          navigate('/login');
        }
        return;
      }

      // Check approval status for jamaah only
      if (requireApproval && roleData.role === 'jamaah') {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        if (profileData?.status !== 'approved') {
          await supabase.auth.signOut();
          navigate('/login');
          return;
        }
      }

      setAuthorized(true);
    } catch (error) {
      console.error('Auth check error:', error);
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
