import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { Bell, Star, Megaphone, AlertCircle, Info } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

export default function AnnouncementsList() {
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, priority, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as Announcement[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("public-announcements-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => {
        queryClient.invalidateQueries({ queryKey: ["public-announcements"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "medium":
        return <Bell className="w-5 h-5 text-gold" />;
      default:
        return <Info className="w-5 h-5 text-secondary" />;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-destructive bg-destructive/5";
      case "medium":
        return "border-l-gold bg-gold/5";
      default:
        return "border-l-secondary bg-secondary/5";
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background relative overflow-hidden">
        <div className="absolute inset-0 stars-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Bell className="w-8 h-8 text-gold animate-pulse mx-auto" />
            <p className="text-muted-foreground mt-2">Memuat pengumuman...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background relative overflow-hidden">
      <div className="absolute inset-0 stars-pattern opacity-20" />
      <div className="absolute inset-0 islamic-pattern opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="flex justify-center gap-2">
            <Star className="w-5 h-5 text-gold animate-pulse" />
            <Megaphone className="w-6 h-6 text-gold" />
            <Star className="w-5 h-5 text-gold animate-pulse" style={{ animationDelay: "0.3s" }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-amiri">
            Pengumuman <span className="text-gradient-gold">Masjid</span>
          </h2>
          <p className="text-muted-foreground">Informasi terbaru untuk jamaah</p>
        </div>

        {/* Announcements Grid */}
        <div className="grid gap-4 max-w-4xl mx-auto">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`p-5 rounded-xl border-l-4 backdrop-blur-sm card-gold-border hover-lift transition-all ${getPriorityStyle(announcement.priority)}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(announcement.priority)}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg text-foreground">{announcement.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{announcement.content}</p>
                  <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                    <Star className="w-3 h-3 text-gold" />
                    {new Date(announcement.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
