import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Upload, Users, Plus, Pencil, Trash2 } from "lucide-react";

interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  foto_url: string | null;
  urutan_tampil: number | null;
}

export default function MosqueProfileCMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ["mosque-profile-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mosque_profile")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: pengurusList, refetch: refetchPengurus } = useQuery({
    queryKey: ["struktur-pengurus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("struktur_pengurus")
        .select("*")
        .order("urutan_tampil", { ascending: true });
      if (error) throw error;
      return data as Pengurus[];
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    logo_url: "",
    banner_url: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Pengurus form state
  const [pengurusDialogOpen, setPengurusDialogOpen] = useState(false);
  const [editingPengurus, setEditingPengurus] = useState<Pengurus | null>(null);
  const [pengurusForm, setPengurusForm] = useState({
    nama: "",
    jabatan: "",
    urutan_tampil: 1,
  });
  const [pengurusFotoFile, setPengurusFotoFile] = useState<File | null>(null);
  const [savingPengurus, setSavingPengurus] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        address: profile.address || "",
        phone: profile.phone || "",
        email: profile.email || "",
        description: profile.description || "",
        logo_url: profile.logo_url || "",
        banner_url: profile.banner_url || "",
      });
    }
  }, [profile]);

  // Real-time subscription for pengurus
  useEffect(() => {
    const channel = supabase
      .channel('struktur-pengurus-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'struktur_pengurus' }, () => {
        refetchPengurus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchPengurus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      let updatedData = { ...formData };

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('mosque-assets')
          .upload(fileName, logoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('mosque-assets')
          .getPublicUrl(fileName);

        updatedData.logo_url = urlData.publicUrl;
      }

      if (bannerFile) {
        const fileExt = bannerFile.name.split('.').pop();
        const fileName = `banner-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('mosque-assets')
          .upload(fileName, bannerFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('mosque-assets')
          .getPublicUrl(fileName);

        updatedData.banner_url = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("mosque_profile")
        .update(updatedData)
        .eq("id", profile?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["mosque-profile-admin"] });
      queryClient.invalidateQueries({ queryKey: ["mosque-profile"] });
      
      toast({
        title: "Berhasil",
        description: "Profil masjid berhasil diperbarui",
      });

      setLogoFile(null);
      setBannerFile(null);
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan saat memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const openAddPengurusDialog = () => {
    setEditingPengurus(null);
    setPengurusForm({ nama: "", jabatan: "", urutan_tampil: (pengurusList?.length || 0) + 1 });
    setPengurusFotoFile(null);
    setPengurusDialogOpen(true);
  };

  const openEditPengurusDialog = (pengurus: Pengurus) => {
    setEditingPengurus(pengurus);
    setPengurusForm({
      nama: pengurus.nama,
      jabatan: pengurus.jabatan,
      urutan_tampil: pengurus.urutan_tampil || 1,
    });
    setPengurusFotoFile(null);
    setPengurusDialogOpen(true);
  };

  const handlePengurusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPengurus(true);

    try {
      let foto_url = editingPengurus?.foto_url || null;

      if (pengurusFotoFile) {
        const fileExt = pengurusFotoFile.name.split('.').pop();
        const fileName = `pengurus-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('struktur-pengurus')
          .upload(fileName, pengurusFotoFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('struktur-pengurus')
          .getPublicUrl(fileName);

        foto_url = urlData.publicUrl;
      }

      if (editingPengurus) {
        const { error } = await supabase
          .from("struktur_pengurus")
          .update({
            nama: pengurusForm.nama,
            jabatan: pengurusForm.jabatan,
            urutan_tampil: pengurusForm.urutan_tampil,
            foto_url,
          })
          .eq("id", editingPengurus.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("struktur_pengurus")
          .insert({
            nama: pengurusForm.nama,
            jabatan: pengurusForm.jabatan,
            urutan_tampil: pengurusForm.urutan_tampil,
            foto_url,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["struktur-pengurus"] });
      setPengurusDialogOpen(false);
      
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
      setSavingPengurus(false);
    }
  };

  const handleDeletePengurus = async (id: string) => {
    try {
      const { error } = await supabase
        .from("struktur_pengurus")
        .delete()
        .eq("id", id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["struktur-pengurus"] });
      toast({
        title: "Berhasil",
        description: "Pengurus berhasil dihapus",
      });
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="p-8">Memuat...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Kelola Profil Masjid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="informasi" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informasi">Informasi Masjid</TabsTrigger>
              <TabsTrigger value="pengurus">Struktur Pengurus</TabsTrigger>
            </TabsList>

            <TabsContent value="informasi" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Masjid</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_file">Upload Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {formData.logo_url && (
                    <p className="text-xs text-muted-foreground">Logo saat ini tersimpan</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner_file">Upload Banner</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="banner_file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {formData.banner_url && (
                    <p className="text-xs text-muted-foreground">Banner saat ini tersimpan</p>
                  )}
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {uploading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="pengurus" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Daftar Pengurus
                  </h3>
                  <Button onClick={openAddPengurusDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Pengurus
                  </Button>
                </div>

                {pengurusList && pengurusList.length > 0 ? (
                  <div className="grid gap-4">
                    {pengurusList.map((pengurus) => (
                      <Card key={pengurus.id} className="bg-muted/30">
                        <CardContent className="p-4 flex items-center gap-4">
                          {pengurus.foto_url ? (
                            <img
                              src={pengurus.foto_url}
                              alt={pengurus.nama}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <Users className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold">{pengurus.nama}</p>
                            <p className="text-sm text-muted-foreground">{pengurus.jabatan}</p>
                            <p className="text-xs text-muted-foreground">Urutan: {pengurus.urutan_tampil}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openEditPengurusDialog(pengurus)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeletePengurus(pengurus.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada data pengurus
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog Tambah/Edit Pengurus */}
      <Dialog open={pengurusDialogOpen} onOpenChange={setPengurusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPengurus ? "Edit Pengurus" : "Tambah Pengurus"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePengurusSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={pengurusForm.nama}
                onChange={(e) => setPengurusForm({ ...pengurusForm, nama: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jabatan">Jabatan</Label>
              <Input
                id="jabatan"
                value={pengurusForm.jabatan}
                onChange={(e) => setPengurusForm({ ...pengurusForm, jabatan: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urutan_tampil">Urutan Tampil</Label>
              <Input
                id="urutan_tampil"
                type="number"
                min={1}
                value={pengurusForm.urutan_tampil}
                onChange={(e) => setPengurusForm({ ...pengurusForm, urutan_tampil: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="foto">Foto</Label>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={(e) => setPengurusFotoFile(e.target.files?.[0] || null)}
              />
              {editingPengurus?.foto_url && (
                <p className="text-xs text-muted-foreground">Foto saat ini tersimpan (upload untuk mengganti)</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={savingPengurus}>
              <Save className="w-4 h-4 mr-2" />
              {savingPengurus ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
