import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Star, Sparkles } from "lucide-react";

interface Donasi {
  id: string;
  nama_donatur: string;
  nominal: number;
  tanggal_donasi: string;
}

export default function DonaturList() {
  const [donaturList, setDonaturList] = useState<Donasi[]>([]);

  const fetchDonatur = async () => {
    const { data, error } = await supabase
      .from("donasi")
      .select("*")
      .eq("status_tampil", true)
      .order("tanggal_donasi", { ascending: false })
      .limit(12);
    
    if (!error && data) {
      setDonaturList(data);
    }
  };

  useEffect(() => {
    fetchDonatur();

    // Real-time subscription
    const channel = supabase
      .channel('donasi-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donasi' }, () => {
        fetchDonatur();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (donaturList.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 stars-pattern opacity-20" />
      <div className="absolute inset-0 islamic-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-gold" />
            <Heart className="w-5 h-5 text-secondary" />
            <Star className="w-5 h-5 text-gold" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground font-amiri">
            Para <span className="text-gradient-gold">Donatur</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Jazakumullahu khairan katsiran kepada para donatur yang telah berkontribusi
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {donaturList.map((donatur, index) => (
            <Card 
              key={donatur.id} 
              className="card-gold-border bg-card/60 backdrop-blur-sm hover-lift group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Heart className="w-7 h-7 text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-foreground truncate">{donatur.nama_donatur}</p>
                  <p className="text-lg font-bold text-gold mt-1">
                    Rp {Number(donatur.nominal).toLocaleString("id-ID")}
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-secondary mx-auto opacity-60" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
