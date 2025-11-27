import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

export default function JamaahManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();

    // Real-time subscription
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data jamaah",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) =>
    profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-primary text-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold font-amiri">Manajemen Jamaah</h1>
          <p className="text-foreground/80 mt-1">Kelola data jamaah masjid</p>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        <Card className="card-gold-border">
          <CardHeader>
            <CardTitle className="font-amiri flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
              Daftar Jamaah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari jamaah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : filteredProfiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada data jamaah</p>
            ) : (
              <div className="grid gap-4">
                {filteredProfiles.map((profile) => (
                  <Card key={profile.id} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
                          <Users className="w-6 h-6 text-gold" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{profile.full_name || "Nama tidak tersedia"}</h3>
                          <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                            {profile.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {profile.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Detail
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
