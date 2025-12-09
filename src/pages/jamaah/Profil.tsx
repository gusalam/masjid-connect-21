import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, MapPin, Mail, ArrowLeft, Save, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  created_at: string | null;
}

export default function JamaahProfil() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat profil"
      });
      return;
    }

    setProfile(data);
    setFormData({
      full_name: data.full_name || "",
      phone: data.phone || "",
      address: data.address || ""
    });
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address
      })
      .eq('id', profile.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menyimpan perubahan"
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui"
      });
      setEditMode(false);
      fetchProfile();
    }
    setSaving(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Menunggu Persetujuan</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Aktif</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/jamaah/dashboard">
              <Button variant="secondary" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-amiri">Profil Saya</h1>
              <p className="text-primary-foreground/80 mt-1">Kelola informasi pribadi Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="card-gold-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-amiri flex items-center gap-2">
                <User className="w-5 h-5 text-gold" />
                Informasi Profil
              </CardTitle>
              {!editMode && (
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  Edit Profil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Status */}
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center border-2 border-gold/30">
                <User className="w-10 h-10 text-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile?.full_name || "Nama belum diisi"}</h2>
                <div className="mt-1">{getStatusBadge(profile?.status || 'pending')}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Bergabung sejak {profile?.created_at ? format(new Date(profile.created_at), "dd MMMM yyyy", { locale: localeId }) : "-"}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap</Label>
                {editMode ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{profile?.full_name || "-"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{email}</span>
                  <Badge variant="outline" className="ml-auto text-xs">Tidak dapat diubah</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">No. Telepon</Label>
                {editMode ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{profile?.phone || "-"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                {editMode ? (
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Masukkan alamat lengkap"
                    rows={3}
                  />
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span>{profile?.address || "-"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {editMode && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Catatan:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Email tidak dapat diubah setelah pendaftaran</li>
                <li>Status akun dikelola oleh admin</li>
                <li>Hubungi admin jika ada pertanyaan terkait akun</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}