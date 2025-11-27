import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Mail, Lock, Chrome, Moon, Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/jamaah/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: error.message || "Terjadi kesalahan saat login dengan Google"
      });
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center gradient-night p-4 relative overflow-hidden">
      {/* Animated Stars Background */}
      <div className="absolute inset-0 stars-pattern opacity-60 animate-pulse" />
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      {/* Decorative Stars */}
      <Star className="absolute top-10 left-10 w-6 h-6 text-gold animate-pulse opacity-60" />
      <Star className="absolute top-32 right-32 w-4 h-4 text-gold animate-pulse opacity-40" style={{ animationDelay: "0.5s" }} />
      <Star className="absolute bottom-32 left-40 w-5 h-5 text-gold animate-pulse opacity-50" style={{ animationDelay: "1s" }} />
      <Star className="absolute bottom-10 right-10 w-6 h-6 text-gold animate-pulse opacity-60" style={{ animationDelay: "1.5s" }} />

      {/* Crescent Moon */}
      <div className="absolute top-20 left-1/4">
        <div className="crescent-moon glow-gold animate-glow" />
      </div>
      
      <div className="w-full max-w-5xl relative z-10 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="text-center md:text-left space-y-6 text-foreground">
            <Link to="/" className="inline-flex items-center gap-3 group mb-8">
              <div className="relative">
                <div className="p-3 bg-card/40 backdrop-blur-md rounded-xl group-hover:scale-110 transition-transform border border-gold/30 glow-gold">
                  <Building2 className="w-8 h-8 text-gold" />
                </div>
                <Star className="absolute -top-1 -right-1 w-3 h-3 text-gold animate-pulse" />
              </div>
              <div>
                <div className="text-2xl font-bold font-amiri">Masjid Al-Ikhlas</div>
                <div className="text-sm opacity-80 flex items-center gap-1">
                  <Moon className="w-3 h-3" />
                  Sistem Pengelolaan Modern
                </div>
              </div>
            </Link>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-gold animate-pulse" />
                <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
                <Star className="w-5 h-5 text-gold animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight font-amiri">
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                <br />
                <span className="block mt-4 text-gradient-gold">Selamat Datang</span>
                <span className="block mt-2 text-gradient-sky">Kembali</span>
              </h1>
              <p className="text-lg opacity-90 leading-relaxed">
                Kelola masjid dengan mudah, transparan, dan profesional. 
                Akses sistem pengelolaan lengkap dalam satu platform yang penuh berkah.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-2 rounded-lg border border-gold/20">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                <span className="text-sm">Transparan</span>
              </div>
              <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-2 rounded-lg border border-secondary/20">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-sm">Aman</span>
              </div>
              <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-2 rounded-lg border border-gold/20">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                <span className="text-sm">Mudah</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="shadow-2xl border-gold/30 backdrop-blur-md bg-card/80 card-gold-border">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-amiri flex items-center gap-2">
                <Moon className="w-6 h-6 text-gold" />
                Login
              </CardTitle>
              <CardDescription>
                Pilih metode login sesuai role Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="jamaah" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="jamaah">Jamaah</TabsTrigger>
                  <TabsTrigger value="staff">Admin / Bendahara</TabsTrigger>
                </TabsList>

                {/* Jamaah Tab - Google OAuth */}
                <TabsContent value="jamaah" className="space-y-4">
                  <div className="space-y-4">
                    <div className="text-center space-y-2 py-4">
                      <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 glow-gold">
                        <Chrome className="w-8 h-8 text-gold" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Login sebagai jamaah menggunakan akun Google Anda
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full font-semibold border-gold/30 hover:border-gold/50 hover:bg-gold/5"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <Chrome className="w-5 h-5 mr-2" />
                      {isLoading ? "Menghubungkan..." : "Login dengan Google"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-gold" />
                      Dengan login, Anda menyetujui syarat dan ketentuan kami
                    </p>
                  </div>
                </TabsContent>

                {/* Staff Tab - Email & Password */}
                <TabsContent value="staff" className="space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@masjidalikhlas.id"
                          className="pl-10 border-gold/30 focus:border-gold"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 border-gold/30 focus:border-gold"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-input" />
                        <span className="text-muted-foreground">Ingat saya</span>
                      </label>
                      <Link to="/forgot-password" className="text-gold hover:underline">
                        Lupa password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gold text-primary font-semibold hover:bg-gold-light glow-gold"
                      disabled={isLoading}
                    >
                      <Moon className="w-5 h-5 mr-2" />
                      {isLoading ? "Memproses..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <Link to="/register" className="text-gold font-medium hover:underline">
                  Daftar di sini
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
