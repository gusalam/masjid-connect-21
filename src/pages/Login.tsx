import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Lock, User, Moon, Star, MapPin, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { PasswordInput } from "@/components/ui/password-input";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        redirectBasedOnRole(session.user.id);
      }
    };
    checkSession();
  }, []);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      console.log('[SESSION CHECK] Checking role for user:', userId);
      
      // Get user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('[SESSION CHECK] Role data:', roleData, 'Error:', roleError);

      if (!roleData || roleError) {
        console.log('[SESSION CHECK] No role found');
        return;
      }

      const userRole = roleData.role;
      console.log('[SESSION CHECK] User role:', userRole);

      // Admin - redirect directly
      if (userRole === 'admin') {
        console.log('[SESSION CHECK] Redirecting admin');
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // Bendahara - redirect directly
      if (userRole === 'bendahara') {
        console.log('[SESSION CHECK] Redirecting bendahara');
        navigate('/bendahara/dashboard', { replace: true });
        return;
      }

      // Jamaah - check approval status
      if (userRole === 'jamaah') {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', userId)
          .single();

        const userStatus = profileData?.status || 'pending';
        console.log('[SESSION CHECK] Jamaah status:', userStatus);

        if (userStatus === 'approved') {
          console.log('[SESSION CHECK] Redirecting approved jamaah');
          navigate('/jamaah/dashboard', { replace: true });
        } else {
          console.log('[SESSION CHECK] Jamaah not approved, signing out');
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error('[SESSION CHECK] Error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const userId = data.user.id;
      console.log('[LOGIN] User ID:', userId);

      // Step 1: Get user role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      console.log('[LOGIN] Role data:', roleData, 'Error:', roleError);

      // If no role found, logout and show error
      if (!roleData || roleError) {
        console.log('[LOGIN] No role found, signing out');
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Login Gagal",
          description: "Role tidak ditemukan. Hubungi admin."
        });
        setIsLoading(false);
        return;
      }

      const userRole = roleData.role;
      console.log('[LOGIN] User role:', userRole);

      // Step 2: Get profile status from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', userId)
        .single();

      console.log('[LOGIN] Profile data:', profileData, 'Error:', profileError);

      const userStatus = profileData?.status || 'pending';
      console.log('[LOGIN] User status:', userStatus);

      // Step 3: Handle redirect based on role and status
      
      // Admin - no approval needed
      if (userRole === 'admin') {
        console.log('[LOGIN] Redirecting admin to /admin/dashboard');
        toast({
          title: "Login Berhasil",
          description: "Selamat datang, Admin!"
        });
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // Bendahara - no approval needed
      if (userRole === 'bendahara') {
        console.log('[LOGIN] Redirecting bendahara to /bendahara/dashboard');
        toast({
          title: "Login Berhasil",
          description: "Selamat datang, Bendahara!"
        });
        navigate('/bendahara/dashboard', { replace: true });
        return;
      }

      // Jamaah - need approval check
      if (userRole === 'jamaah') {
        console.log('[LOGIN] Jamaah detected, checking approval status:', userStatus);
        
        if (userStatus !== 'approved') {
          console.log('[LOGIN] Jamaah not approved, signing out');
          await supabase.auth.signOut();
          
          if (userStatus === 'rejected') {
            toast({
              variant: "destructive",
              title: "Akun Ditolak",
              description: "Maaf, pendaftaran Anda ditolak. Silakan hubungi admin."
            });
          } else {
            toast({
              variant: "destructive",
              title: "Akun Menunggu Persetujuan",
              description: "Akun Anda menunggu persetujuan admin. Silakan tunggu konfirmasi."
            });
          }
          setIsLoading(false);
          return;
        }

        // Jamaah approved - redirect to dashboard
        console.log('[LOGIN] Jamaah approved, redirecting to /jamaah/dashboard');
        toast({
          title: "Login Berhasil",
          description: "Selamat datang kembali!"
        });
        navigate('/jamaah/dashboard', { replace: true });
        return;
      }

      // Unknown role - logout
      console.log('[LOGIN] Unknown role, signing out');
      await supabase.auth.signOut();
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: "Role tidak valid. Hubungi admin."
      });
      setIsLoading(false);

    } catch (error: any) {
      console.error('[LOGIN] Error:', error);
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: error.message || "Email atau password salah"
      });
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      // Update profile with additional data and set status to pending
      if (data.user) {
        await supabase.from('profiles').update({
          phone,
          address,
          status: 'pending'
        }).eq('id', data.user.id);

        // Assign jamaah role
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'jamaah'
        });
      }

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda sedang menunggu persetujuan admin. Silakan tunggu konfirmasi."
      });

      // Sign out after registration (pending approval)
      await supabase.auth.signOut();

      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setAddress("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Pendaftaran Gagal",
        description: error.message || "Terjadi kesalahan saat mendaftar"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-night p-4 relative overflow-hidden">
      <div className="absolute inset-0 stars-pattern opacity-60" />
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      
      {/* Decorative Stars */}
      <Star className="absolute top-10 left-10 w-6 h-6 text-gold animate-pulse opacity-60" />
      <Star className="absolute top-32 right-32 w-4 h-4 text-gold animate-pulse opacity-40" />
      <Star className="absolute bottom-32 left-40 w-5 h-5 text-gold animate-pulse opacity-50" />
      <Star className="absolute bottom-10 right-10 w-6 h-6 text-gold animate-pulse opacity-60" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="p-3 bg-card/40 backdrop-blur-md rounded-xl border border-gold/30">
              <Building2 className="w-8 h-8 text-gold" />
            </div>
            <span className="text-2xl font-bold font-amiri text-foreground">Masjid Al-Ikhlas</span>
          </Link>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl border-gold/30 backdrop-blur-md bg-card/90 card-gold-border">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl font-amiri flex items-center justify-center gap-2">
              <Moon className="w-5 h-5 text-gold" />
              Akses Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="email@contoh.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                      <PasswordInput
                        id="login-password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gold text-primary font-semibold hover:bg-gold-light"
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nama Lengkap</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Nama lengkap Anda"
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-phone">No. Telepon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        className="pl-10"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="email@contoh.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-address">Alamat</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Textarea
                        id="register-address"
                        placeholder="Alamat lengkap"
                        className="pl-10 min-h-[60px]"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                      <PasswordInput
                        id="register-password"
                        placeholder="Minimal 6 karakter"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p>📋 Setelah mendaftar, akun Anda akan menunggu persetujuan admin.</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gold text-primary font-semibold hover:bg-gold-light"
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Daftar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-muted-foreground hover:text-gold">
                ← Kembali ke Beranda
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
