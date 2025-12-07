import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Lock, User, Moon, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!"
      });

      // Check user role and redirect accordingly
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleData?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (roleData?.role === 'bendahara') {
        navigate('/bendahara/dashboard');
      } else {
        navigate('/jamaah/dashboard');
      }
    } catch (error: any) {
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

      // Assign jamaah role
      if (data.user) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'jamaah'
        });
      }

      toast({
        title: "Pendaftaran Berhasil",
        description: "Silakan cek email untuk verifikasi akun Anda"
      });

      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
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
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
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
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Minimal 6 karakter"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
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
