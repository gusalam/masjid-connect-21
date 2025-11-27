import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Clock, Star, Moon, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function Kegiatan() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["public-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("activity_date", { ascending: true });
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
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4 animate-fade-in">
            <div className="flex justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-gold animate-pulse" />
              <Calendar className="w-6 h-6 text-secondary animate-pulse" />
              <Star className="w-6 h-6 text-gold animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-amiri">
              <span className="text-gradient-gold">Jadwal Kegiatan</span> Masjid
            </h1>
            <p className="text-lg text-muted-foreground">
              Ikuti berbagai kegiatan dan kajian yang diadakan di masjid kami
            </p>
          </div>

          {/* Activities Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
              {activities.map((activity) => (
                <Card 
                  key={activity.id}
                  className="bg-card/80 backdrop-blur-sm card-gold-border hover-lift group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
                        {activity.category || "Kegiatan"}
                      </Badge>
                      {activity.is_recurring && (
                        <Badge variant="outline" className="border-secondary/50 text-secondary">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Rutin
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-gold transition-colors">
                      {activity.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activity.description && (
                      <p className="text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-gold" />
                        {format(new Date(activity.activity_date), "EEEE, d MMMM yyyy", { locale: id })}
                      </div>
                      {activity.activity_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-gold" />
                          {activity.activity_time}
                        </div>
                      )}
                      {activity.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-gold" />
                          {activity.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/80 backdrop-blur-sm card-gold-border max-w-md mx-auto">
              <CardContent className="p-12 text-center">
                <Moon className="w-16 h-16 text-gold mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Kegiatan</h3>
                <p className="text-muted-foreground">
                  Kegiatan akan segera diumumkan
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}