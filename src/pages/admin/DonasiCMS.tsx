import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Heart, Plus, Pencil, Trash2, DollarSign, Eye, EyeOff } from "lucide-react";

interface Donasi {
  id: string;
  nama_donatur: string;
  nominal: number;
  tanggal_donasi: string;
  status_tampil: boolean;
}

export default function DonasiCMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDonasi, setEditingDonasi] = useState<Donasi | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nama_donatur: "",
    nominal: 0,
    tanggal_donasi: new Date().toISOString().split('T')[0],
    status_tampil: true,
  });

  const { data: donasiList, refetch } = useQuery({
    queryKey: ["donasi-cms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donasi")
        .select("*")
        .order("tanggal_donasi", { ascending: false });
      
      if (error) throw error;
      return data as Donasi[];
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('donasi-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donasi' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const openAddDialog = () => {
    setEditingDonasi(null);
    setFormData({
      nama_donatur: "",
      nominal: 0,
      tanggal_donasi: new Date().toISOString().split('T')[0],
      status_tampil: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (donasi: Donasi) => {
    setEditingDonasi(donasi);
    setFormData({
      nama_donatur: donasi.nama_donatur,
      nominal: donasi.nominal,
      tanggal_donasi: donasi.tanggal_donasi,
      status_tampil: donasi.status_tampil,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingDonasi) {
        const { error } = await supabase
          .from("donasi")
          .update({
            nama_donatur: formData.nama_donatur,
            nominal: formData.nominal,
            tanggal_donasi: formData.tanggal_donasi,
            status_tampil: formData.status_tampil,
          })
          .eq("id", editingDonasi.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("donasi")
          .insert({
            nama_donatur: formData.nama_donatur,
            nominal: formData.nominal,
            tanggal_donasi: formData.tanggal_donasi,
            status_tampil: formData.status_tampil,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["donasi-cms"] });
      queryClient.invalidateQueries({ queryKey: ["donasi-homepage"] });
      setDialogOpen(false);
      
      toast({
        title: "Berhasil",
        description: "Perubahan berhasil disimpan",
      });
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("donasi")
        .delete()
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["donasi-cms"] });
      queryClient.invalidateQueries({ queryKey: ["donasi-homepage"] });
      
      toast({
        title: "Berhasil",
        description: "Donatur berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (donasi: Donasi) => {
    try {
      const { error } = await supabase
        .from("donasi")
        .update({ status_tampil: !donasi.status_tampil })
        .eq("id", donasi.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["donasi-cms"] });
      queryClient.invalidateQueries({ queryKey: ["donasi-homepage"] });
      
      toast({
        title: "Berhasil",
        description: `Donatur ${!donasi.status_tampil ? 'ditampilkan' : 'disembunyikan'}`,
      });
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const totalDonasi = donasiList?.reduce((sum, d) => sum + Number(d.nominal), 0) || 0;
  const displayedCount = donasiList?.filter(d => d.status_tampil).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-primary text-foreground p-6 shadow-lg">
        <div className="absolute inset-0 stars-pattern opacity-20" />
        <div className="container mx-auto relative z-10">
          <h1 className="text-3xl font-bold font-amiri">Kelola Donatur</h1>
          <p className="text-foreground/80 mt-1">Kelola data donatur yang ditampilkan di homepage</p>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donasi</p>
                  <p className="text-2xl font-bold text-gold mt-2">
                    Rp {totalDonasi.toLocaleString("id-ID")}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donatur</p>
                  <p className="text-2xl font-bold mt-2">{donasiList?.length || 0}</p>
                </div>
                <Heart className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ditampilkan</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{displayedCount}</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card className="card-gold-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-amiri flex items-center gap-2">
              <Heart className="w-5 h-5 text-gold" />
              Daftar Donatur
            </CardTitle>
            <Button onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Donatur
            </Button>
          </CardHeader>
          <CardContent>
            {!donasiList || donasiList.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada data donatur</p>
            ) : (
              <div className="space-y-3">
                {donasiList.map((donasi) => (
                  <div key={donasi.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-gold/20">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
                        <Heart className="w-6 h-6 text-gold" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{donasi.nama_donatur}</p>
                          {donasi.status_tampil ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(donasi.tanggal_donasi).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-xl font-bold text-gold">
                          Rp {Number(donasi.nominal).toLocaleString("id-ID")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleStatus(donasi)}
                        title={donasi.status_tampil ? "Sembunyikan" : "Tampilkan"}
                      >
                        {donasi.status_tampil ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditDialog(donasi)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(donasi.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Tambah/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDonasi ? "Edit Donatur" : "Tambah Donatur"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama_donatur">Nama Donatur</Label>
              <Input
                id="nama_donatur"
                value={formData.nama_donatur}
                onChange={(e) => setFormData({ ...formData, nama_donatur: e.target.value })}
                placeholder="Nama donatur"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nominal">Nominal (Rp)</Label>
              <Input
                id="nominal"
                type="number"
                min={0}
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_donasi">Tanggal Donasi</Label>
              <Input
                id="tanggal_donasi"
                type="date"
                value={formData.tanggal_donasi}
                onChange={(e) => setFormData({ ...formData, tanggal_donasi: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="status_tampil">Tampilkan di Homepage</Label>
              <Switch
                id="status_tampil"
                checked={formData.status_tampil}
                onCheckedChange={(checked) => setFormData({ ...formData, status_tampil: checked })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
