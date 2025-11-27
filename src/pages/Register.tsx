import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, User, Phone, Chrome, Moon, Star, Sparkles, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleRegister = async () => {
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
        title: "Pendaftaran Gagal",
        description: error.message || "Terjadi kesalahan saat mendaftar dengan Google"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-night p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 stars-pattern opacity-60 animate-pulse" />
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      
      {/* Animated Stars */}
      <Star className="absolute top-10 left-10 w-6 h-6 text-gold animate-pulse opacity-60" />
      <Star className="absolute top-32 right-32 w-4 h-4 text-gold animate-pulse opacity-40" style={{ animationDelay: "0.5s" }} />
      <Sparkles className="absolute top-1/4 left-1/4 w-5 h-5 text-secondary animate-pulse opacity-50" style={{ animationDelay: "1s" }} />
      <Star className="absolute bottom-32 left-40 w-5 h-5 text-gold animate-pulse opacity-50" style={{ animationDelay: "1.5s" }} />
      <Sparkles className="absolute bottom-20 right-20 w-6 h-6 text-secondary animate-pulse opacity-60" style={{ animationDelay: "2s" }} />
      <Star className="absolute bottom-10 right-10 w-6 h-6 text-gold animate-pulse opacity-60" style={{ animationDelay: "2.5s" }} />

      {/* Crescent Moon with Glow */}
      <div className="absolute top-20 left-1/4">
        <div className="crescent-moon glow-gold animate-glow" />
      </div>
      
      <div className="w-full max-w-6xl relative z-10 animate-fade-in">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Islamic Welcome */}
          <div className="text-center md:text-left space-y-8 text-foreground">
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
            
            <div className="space-y-6">
              {/* Islamic Greeting */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Star className="w-5 h-5 text-gold animate-pulse" />
                <Sparkles className="w-5 h-5 text-secondary animate-pulse" style={{ animationDelay: "0.3s" }} />
                <Heart className="w-5 h-5 text-gold animate-pulse" style={{ animationDelay: "0.6s" }} />
                <Sparkles className="w-5 h-5 text-secondary animate-pulse" style={{ animationDelay: "0.9s" }} />
                <Star className="w-5 h-5 text-gold animate-pulse" style={{ animationDelay: "1.2s" }} />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight font-amiri">
                <span className="block text-gradient-gold animate-fade-in">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </span>
                <span className="block mt-4 text-gradient-sky animate-fade-in" style={{ animationDelay: "0.2s" }}>
                  Bergabunglah Bersama
                </span>
                <span className="block mt-2 text-gradient-gold animate-fade-in" style={{ animationDelay: "0.4s" }}>
                  Komunitas Islami
                </span>
              </h1>
              
              <p className="text-lg opacity-90 leading-relaxed animate-fade-in" style={{ animationDelay: "0.6s" }}>
                Daftarkan diri Anda untuk menjadi bagian dari jamaah yang mendapat kemudahan akses informasi masjid, 
                kegiatan, dan berbagai program Islami lainnya.
              </p>

              {/* Islamic Quote */}
              <div className="p-6 bg-card/40 backdrop-blur-md rounded-2xl border border-gold/30 space-y-3 animate-fade-in" style={{ animationDelay: "0.8s" }}>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold animate-pulse" />
                  <span className="text-sm font-semibold text-gold">Hadits Rasulullah ﷺ</span>
                </div>
                <p className="text-sm italic leading-relaxed text-foreground/90">
                  "Barangsiapa yang memudahkan kesulitan seorang mukmin di dunia, 
                  maka Allah akan memudahkan kesulitannya di hari kiamat."
                </p>
                <p className="text-xs text-muted-foreground">(HR. Muslim)</p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4 animate-fade-in" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-3 rounded-lg border border-gold/20 hover:border-gold/40 transition-colors">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                <span className="text-sm">Notifikasi Kegiatan</span>
              </div>
              <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-3 rounded-lg border border-secondary/20 hover:border-secondary/40 transition-colors">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-sm">Donasi Mudah</span>
              </div>
              <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-3 rounded-lg border border-gold/20 hover:border-gold/40 transition-colors">
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                <span className="text-sm">Info Transparan</span>
              </div>
              <div className="flex items-center gap-2 bg-card/40 backdrop-blur-md px-4 py-3 rounded-lg border border-secondary/20 hover:border-secondary/40 transition-colors">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                <span className="text-sm">Dashboard Jamaah</span>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <Card className="shadow-2xl border-gold/30 backdrop-blur-md bg-card/80 card-gold-border animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-amiri flex items-center gap-2">
                <Moon className="w-6 h-6 text-gold" />
                Daftar Sebagai Jamaah
              </CardTitle>
              <CardDescription>
                Bergabunglah dengan komunitas masjid yang penuh berkah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Google Registration */}
              <div className="space-y-4">
                <div className="text-center space-y-3 py-4">
                  <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center border-2 border-gold/30 glow-gold animate-pulse">
                    <Chrome className="w-8 h-8 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Pendaftaran Cepat</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Daftar dengan akun Google Anda dalam satu klik
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="w-full bg-gold text-primary font-semibold hover:bg-gold-light glow-gold group"
                  onClick={handleGoogleRegister}
                  disabled={isLoading}
                >
                  <Chrome className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  {isLoading ? "Mendaftarkan..." : "Daftar dengan Google"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gold/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Keuntungan Mendaftar
                    </span>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-3 py-2">
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Akses Informasi Kegiatan</p>
                      <p className="text-xs text-muted-foreground">Dapatkan update terbaru tentang kajian, pengajian, dan acara masjid</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Donasi Praktis & Aman</p>
                      <p className="text-xs text-muted-foreground">Salurkan infaq dan sedekah Anda dengan mudah dan transparan</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Dashboard Pribadi</p>
                      <p className="text-xs text-muted-foreground">Pantau riwayat donasi dan kegiatan yang Anda ikuti</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1 flex-wrap">
                  <Star className="w-3 h-3 text-gold" />
                  Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami
                  <Star className="w-3 h-3 text-gold" />
                </p>
              </div>

              <div className="pt-4 border-t border-gold/20 text-center text-sm text-muted-foreground">
                Sudah punya akun?{" "}
                <Link to="/login" className="text-gold font-medium hover:underline">
                  Login di sini
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Islamic Quote */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "1.2s" }}>
          <div className="inline-flex items-center gap-3 text-foreground/80">
            <Star className="w-4 h-4 text-gold animate-pulse" />
            <span className="text-lg font-amiri">
              وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى
            </span>
            <Star className="w-4 h-4 text-gold animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Dan tolong-menolonglah kamu dalam (mengerjakan) kebajikan dan takwa
          </p>
        </div>
      </div>
    </div>
  );
}
