import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, MapPin, Phone, Mail, Star, Moon, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  foto_url: string | null;
  urutan_tampil: number | null;
}

export default function Tentang() {
  const [pengurusList, setPengurusList] = useState<Pengurus[]>([]);

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

  const fetchPengurus = async () => {
    const { data, error } = await supabase
      .from("struktur_pengurus")
      .select("*")
      .order("urutan_tampil", { ascending: true });
    
    if (!error && data) {
      setPengurusList(data);
    }
  };

  useEffect(() => {
    fetchPengurus();

    // Real-time subscription
    const channel = supabase
      .channel('public-struktur-pengurus')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'struktur_pengurus' }, () => {
        fetchPengurus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
                Tentang <span className="text-gradient-gold">{mosqueProfile?.name || "Masjid Kami"}</span>
              </h1>
            </div>

            {/* Banner */}
            {mosqueProfile?.banner_url && (
              <div className="rounded-2xl overflow-hidden shadow-xl card-gold-border">
                <img 
                  src={mosqueProfile.banner_url} 
                  alt={mosqueProfile.name}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            )}

            {/* Description */}
            <Card className="bg-card/80 backdrop-blur-sm card-gold-border">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-gold" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Tentang Kami</h2>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {mosqueProfile?.description || "Masjid yang membawa berkah untuk umat"}
                </p>
              </CardContent>
            </Card>

            {/* Struktur Pengurus */}
            {pengurusList.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm card-gold-border">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                      <Users className="w-6 h-6 text-gold" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Struktur Pengurus</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pengurusList.map((pengurus) => (
                      <div
                        key={pengurus.id}
                        className="text-center p-6 rounded-xl bg-muted/30 border border-gold/20 hover-lift"
                      >
                        {pengurus.foto_url ? (
                          <img
                            src={pengurus.foto_url}
                            alt={pengurus.nama}
                            className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-2 border-gold/30"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center border-2 border-gold/30">
                            <Users className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <h3 className="font-semibold text-foreground">{pengurus.nama}</h3>
                        <p className="text-sm text-gold mt-1">{pengurus.jabatan}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card className="bg-card/80 backdrop-blur-sm card-gold-border">
              <CardContent className="p-8 space-y-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Informasi Kontak</h2>
                <div className="grid gap-6">
                  {mosqueProfile?.address && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Alamat</h3>
                        <p className="text-muted-foreground">{mosqueProfile.address}</p>
                      </div>
                    </div>
                  )}
                  {mosqueProfile?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Telepon</h3>
                        <p className="text-muted-foreground">{mosqueProfile.phone}</p>
                      </div>
                    </div>
                  )}
                  {mosqueProfile?.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Email</h3>
                        <p className="text-muted-foreground">{mosqueProfile.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
