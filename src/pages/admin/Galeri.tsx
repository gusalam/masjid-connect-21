import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Image, Plus, Trash2, Search, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GalleryItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  created_at: string;
}

export default function GalleryManagement() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchGallery();

    // Real-time subscription
    const channel = supabase
      .channel('gallery-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        fetchGallery();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGallery(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat galeri",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast({
        title: "Error",
        description: "Silakan pilih gambar",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Upload image to storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      // Insert into database
      const { error: dbError } = await supabase
        .from("gallery")
        .insert([{
          ...formData,
          image_url: urlData.publicUrl
        }]);

      if (dbError) throw dbError;

      toast({
        title: "Berhasil",
        description: "Gambar berhasil ditambahkan",
      });

      setFormData({ title: "", description: "", category: "" });
      setImageFile(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan gambar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Yakin ingin menghapus gambar ini?")) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from storage
      await supabase.storage
        .from('gallery')
        .remove([fileName]);

      // Delete from database
      const { error } = await supabase
        .from("gallery")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Gambar berhasil dihapus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus gambar",
        variant: "destructive",
      });
    }
  };

  const filteredGallery = gallery.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-primary text-foreground p-4 sm:p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-xl sm:text-3xl font-bold font-amiri">Manajemen Galeri</h1>
          <p className="text-foreground/80 mt-1 text-sm sm:text-base">Kelola foto dan dokumentasi masjid</p>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Card className="card-gold-border">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="font-amiri flex items-center gap-2 text-base sm:text-xl">
                <Image className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                Galeri Foto
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gold hover:bg-gold/90 text-sm w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                    Tambah Foto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Tambah Foto Baru</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Judul</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Upload Gambar</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                          required
                        />
                        <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Kategori</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Contoh: Kegiatan, Kajian, Renovasi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Deskripsi</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={uploading}>
                      {uploading ? "Mengupload..." : "Simpan"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari foto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : filteredGallery.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Tidak ada foto</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGallery.map((item) => (
                  <Card key={item.id} className="hover-lift overflow-hidden">
                    <div className="aspect-video relative overflow-hidden bg-muted">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold mb-1 text-sm sm:text-base truncate">{item.title}</h3>
                      {item.category && (
                        <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      )}
                      {item.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full mt-3 text-xs sm:text-sm"
                        onClick={() => handleDelete(item.id, item.image_url)}
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Hapus
                      </Button>
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
