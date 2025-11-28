import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Phone, MapPin, Moon, Star, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const { data: profile } = useQuery({
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
    <footer className="bg-card/60 backdrop-blur-sm border-t border-gold/20 relative overflow-hidden">
      {/* Star Pattern Background */}
      <div className="absolute inset-0 stars-pattern opacity-10" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center glow-gold">
                  <Building2 className="w-7 h-7 text-gold" />
                </div>
                <Star className="absolute -top-1 -right-1 w-3 h-3 text-gold animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground font-amiri">{profile?.name || "Masjid Al-Ikhlas"}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistem pengelolaan masjid yang transparan, modern, dan penuh berkah.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground font-amiri flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" />
              Menu Cepat
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/tentang" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/kegiatan" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Kegiatan
                </Link>
              </li>
              <li>
                <Link to="/kontak" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground font-amiri flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" />
              Dukungan
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/bantuan" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privasi" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link to="/syarat" className="text-sm text-muted-foreground hover:text-gold transition-colors">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground font-amiri flex items-center gap-2">
              <Star className="w-4 h-4 text-gold" />
              Kontak
            </h3>
            <ul className="space-y-3">
              {profile?.address && (
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <span>{profile.address}</span>
                </li>
              )}
              {profile?.phone && (
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>{profile.phone}</span>
                </li>
              )}
              {profile?.email && (
                <li className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>{profile.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gold/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              © {currentYear} {profile?.name || "Masjid Al-Ikhlas"}. Dibuat dengan 
              <Heart className="w-4 h-4 text-gold animate-pulse" /> 
              untuk kemudahan umat.
            </p>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gold animate-pulse" />
              <span className="text-sm text-muted-foreground font-amiri">
                بَارَكَ اللّٰهُ فِيْكُمْ
              </span>
              <Star className="w-4 h-4 text-gold animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
