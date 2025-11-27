import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";

export default function ActivitiesCMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    activity_date: "",
    activity_time: "",
    location: "",
    is_recurring: false,
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("activity_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("activities-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activities" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["activities-admin"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log('Creating activity with data:', data);
      const { data: insertedData, error } = await supabase
        .from("activities")
        .insert([data])
        .select();
      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      console.log('Activity created successfully:', insertedData);
      return insertedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities-admin"] });
      toast({ title: "Berhasil", description: "Kegiatan berhasil ditambahkan" });
      resetForm();
      setIsOpen(false);
    },
    onError: (error: any) => {
      console.error("Create mutation error:", error);
      toast({ 
        title: "Gagal", 
        description: error.message || "Gagal menambahkan kegiatan",
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("activities")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities-admin"] });
      toast({ title: "Berhasil", description: "Kegiatan berhasil diperbarui" });
      resetForm();
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal", 
        description: error.message || "Gagal memperbarui kegiatan",
        variant: "destructive"
      });
      console.error("Error updating activity:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("activities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities-admin"] });
      toast({ title: "Berhasil", description: "Kegiatan berhasil dihapus" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal", 
        description: error.message || "Gagal menghapus kegiatan",
        variant: "destructive"
      });
      console.error("Error deleting activity:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      activity_date: "",
      activity_time: "",
      location: "",
      is_recurring: false,
    });
    setEditingId(null);
  };

  const handleEdit = (activity: any) => {
    setFormData({
      title: activity.title,
      description: activity.description || "",
      category: activity.category || "",
      activity_date: activity.activity_date,
      activity_time: activity.activity_time || "",
      location: activity.location || "",
      is_recurring: activity.is_recurring || false,
    });
    setEditingId(activity.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate date format
    if (!formData.activity_date) {
      toast({
        title: "Error",
        description: "Tanggal kegiatan harus diisi",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting form with data:', formData);
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Kelola Kegiatan
          </h1>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kegiatan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Kegiatan</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity_date">Tanggal</Label>
                    <Input
                      id="activity_date"
                      type="date"
                      value={formData.activity_date}
                      onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity_time">Waktu</Label>
                    <Input
                      id="activity_time"
                      type="time"
                      value={formData.activity_time}
                      onChange={(e) => setFormData({ ...formData, activity_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                  />
                  <Label htmlFor="is_recurring">Kegiatan Rutin</Label>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Perbarui" : "Tambah"} Kegiatan
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Memuat...</div>
        ) : (
          <div className="grid gap-4">
            {activities?.map((activity) => (
              <Card key={activity.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{activity.title}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteMutation.mutate(activity.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {activity.description && <p>{activity.description}</p>}
                    <div className="flex flex-wrap gap-4">
                      <span>📅 {format(new Date(activity.activity_date), "d MMMM yyyy", { locale: id })}</span>
                      {activity.activity_time && <span>🕐 {activity.activity_time}</span>}
                      {activity.category && <span>🏷️ {activity.category}</span>}
                      {activity.location && <span>📍 {activity.location}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}