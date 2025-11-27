import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Donasi() {
  const navigate = useNavigate();

  const { data: verifiedDonations } = useQuery({
    queryKey: ["verified-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "verified")
        .order("verified_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Duplicate the array for seamless loop
  const donorsList = verifiedDonations ? [...verifiedDonations, ...verifiedDonations] : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="relative overflow-hidden">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary via-accent to-secondary text-primary-foreground py-20 px-4">
          <div className="absolute inset-0 stars-pattern opacity-20" />
          <div className="container mx-auto text-center relative z-10 space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-8 h-8 text-gold animate-pulse" />
              <Heart className="w-12 h-12 text-gold" />
              <Star className="w-8 h-8 text-gold animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-amiri">
              Daftar Donatur
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Terima kasih kepada para dermawan yang telah berkontribusi untuk kemakmuran masjid
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/login")}
                className="gradient-primary text-primary-foreground font-semibold text-lg px-8 py-6 hover-scale"
              >
                <Heart className="w-5 h-5 mr-2" />
                Donasi Sekarang
              </Button>
            </div>
          </div>
        </div>

        {/* Donors Marquee Section */}
        <div className="py-16 bg-card/60 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-6 h-6 text-gold" />
                <h2 className="text-3xl font-bold font-amiri">Para Donatur</h2>
                <Star className="w-6 h-6 text-gold" />
              </div>
              <p className="text-muted-foreground">
                بَارَكَ اللّٰهُ فِيْكُمْ - Semoga Allah memberkahi kalian
              </p>
            </div>

            {/* Vertical Marquee Container */}
            <div className="max-w-4xl mx-auto">
              <div className="relative h-[600px] overflow-hidden rounded-2xl border-2 border-gold/30 bg-gradient-to-b from-card via-card/95 to-card shadow-2xl">
                {/* Gradient Overlays */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-card to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-card to-transparent z-10" />
                
                {/* Scrolling Content */}
                <div className="donors-scroll">
                  {donorsList.length > 0 ? (
                    donorsList.map((donation, index) => (
                      <Card 
                        key={`${donation.id}-${index}`}
                        className="mx-4 mb-4 p-6 bg-gradient-to-r from-card to-muted/50 border-gold/20 hover:border-gold/40 transition-all hover-scale"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold/20 to-gold/40 flex items-center justify-center border-2 border-gold/50">
                              <Heart className="w-6 h-6 text-gold" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-foreground">
                                {donation.donor_name || "Hamba Allah"}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(donation.verified_at!), "d MMMM yyyy", { locale: id })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-gold">
                              {formatCurrency(Number(donation.amount))}
                            </p>
                            <p className="text-xs text-muted-foreground">{donation.category}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Memuat data donatur...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12">
              <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-gold/30">
                <div className="space-y-4">
                  <Star className="w-12 h-12 text-gold mx-auto" />
                  <h3 className="text-2xl font-bold font-amiri">Jadilah Bagian dari Kebaikan</h3>
                  <p className="text-muted-foreground">
                    Setiap donasi Anda adalah investasi untuk akhirat. Mari bersama-sama memakmurkan rumah Allah.
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => navigate("/login")}
                    className="gradient-primary text-primary-foreground font-semibold hover-scale"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Mulai Berdonasi
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
