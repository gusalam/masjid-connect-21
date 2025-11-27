import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Save, Upload } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setUploading(true);
      let updatedData = { ...formData };

      // Upload logo if selected
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

      // Upload banner if selected
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

      // Update database
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
        </CardContent>
      </Card>
    </div>
  );
}