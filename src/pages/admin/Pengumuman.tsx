import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Edit, Trash2, Bell, Star, Moon, Sparkles, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PengumumanManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium",
    is_active: true,
  });

  // Fetch announcements
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("announcements-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("announcements").insert({
        title: data.title,
        content: data.content,
        priority: data.priority,
        is_active: data.is_active,
        created_by: userData.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Pengumuman berhasil ditambahkan" });
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Gagal", description: error.message });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string } & typeof formData) => {
      const { error } = await supabase
        .from("announcements")
        .update({
          title: data.title,
          content: data.content,
          priority: data.priority,
          is_active: data.is_active,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Pengumuman berhasil diperbarui" });
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      resetForm();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Gagal", description: error.message });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Pengumuman berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Gagal", description: error.message });
    },
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", priority: "medium", is_active: true });
    setEditingAnnouncement(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || "medium",
      is_active: announcement.is_active ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: "bg-destructive/20 text-destructive border-destructive/30",
      medium: "bg-gold/20 text-gold border-gold/30",
      low: "bg-muted text-muted-foreground border-muted",
    };
    const labels: Record<string, string> = {
      high: "Penting",
      medium: "Normal",
      low: "Rendah",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[priority] || styles.medium}`}>
        {labels[priority] || "Normal"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative gradient-primary text-foreground p-6 shadow-lg overflow-hidden">
        <div className="absolute inset-0 stars-pattern opacity-20" />
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <Star className="absolute top-4 right-10 w-5 h-5 text-gold animate-pulse opacity-60" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")} className="hover:bg-gold/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Megaphone className="w-6 h-6 text-gold animate-pulse" />
                <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold font-amiri">Kelola Pengumuman</h1>
              <p className="text-foreground/80 text-sm">Tambah, edit, dan kelola pengumuman masjid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Add Button */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="bg-gold hover:bg-gold-light text-primary">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pengumuman
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-amiri flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gold" />
                  {editingAnnouncement ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Pengumuman</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Masukkan judul pengumuman"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Isi Pengumuman</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Masukkan isi pengumuman..."
                    rows={4}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prioritas</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Penting</SelectItem>
                        <SelectItem value="medium">Normal</SelectItem>
                        <SelectItem value="low">Rendah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2 h-10">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <span className="text-sm">{formData.is_active ? "Aktif" : "Nonaktif"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-gold hover:bg-gold-light text-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingAnnouncement ? "Simpan Perubahan" : "Tambah Pengumuman"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Announcements List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card className="card-gold-border bg-card/60">
              <CardContent className="py-8 text-center text-muted-foreground">
                Memuat pengumuman...
              </CardContent>
            </Card>
          ) : announcements?.length === 0 ? (
            <Card className="card-gold-border bg-card/60">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada pengumuman</p>
                <p className="text-sm">Klik tombol "Tambah Pengumuman" untuk membuat pengumuman baru</p>
              </CardContent>
            </Card>
          ) : (
            announcements?.map((announcement) => (
              <Card key={announcement.id} className="card-gold-border bg-card/60 backdrop-blur-sm hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        {getPriorityBadge(announcement.priority)}
                        <span className={`px-2 py-1 text-xs rounded-full ${announcement.is_active ? "bg-green-500/20 text-green-500 border border-green-500/30" : "bg-muted text-muted-foreground border border-muted"}`}>
                          {announcement.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Moon className="w-3 h-3" />
                        {new Date(announcement.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(announcement)} className="border-gold/30 hover:border-gold/50">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="border-destructive/30 hover:border-destructive/50 hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Pengumuman?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Pengumuman "{announcement.title}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(announcement.id)} className="bg-destructive hover:bg-destructive/90">
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
