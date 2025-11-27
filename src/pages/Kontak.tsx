import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Star, Moon, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Kontak() {
  const { data: mosqueProfile } = useQuery({
    queryKey: ["mosque-profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mosque_profile")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16 relative">
        <div className="absolute inset-0 gradient-night opacity-50" />
        <div className="absolute inset-0 stars-pattern opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4 animate-fade-in">
              <div className="flex justify-center gap-2 mb-4">
                <Star className="w-6 h-6 text-gold animate-pulse" />
                <Moon className="w-6 h-6 text-gold animate-pulse" />
                <Star className="w-6 h-6 text-gold animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground font-amiri">
                <span className="text-gradient-gold">Hubungi</span> Kami
              </h1>
              <p className="text-lg text-muted-foreground">
                Kami senang mendengar dari Anda
              </p>
            </div>

            {/* Contact Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card/80 backdrop-blur-sm card-gold-border hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Alamat</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {mosqueProfile?.address || "Alamat belum tersedia"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm card-gold-border hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Telepon</h3>
                      <a 
                        href={`tel:${mosqueProfile?.phone}`}
                        className="text-muted-foreground hover:text-gold transition-colors"
                      >
                        {mosqueProfile?.phone || "Nomor belum tersedia"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm card-gold-border hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Email</h3>
                      <a 
                        href={`mailto:${mosqueProfile?.email}`}
                        className="text-muted-foreground hover:text-gold transition-colors"
                      >
                        {mosqueProfile?.email || "Email belum tersedia"}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm card-gold-border hover-lift">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Nama Masjid</h3>
                      <p className="text-muted-foreground">
                        {mosqueProfile?.name || "Masjid Al-Ikhlas"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logo */}
            {mosqueProfile?.logo_url && (
              <div className="text-center">
                <Card className="inline-block bg-card/80 backdrop-blur-sm card-gold-border p-8">
                  <img 
                    src={mosqueProfile.logo_url} 
                    alt={mosqueProfile.name}
                    className="w-32 h-32 object-contain mx-auto"
                  />
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}