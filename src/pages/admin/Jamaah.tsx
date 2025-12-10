import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Phone, MapPin, Check, X, Eye, Pencil, Trash2, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  status: string;
  created_at: string | null;
}

export default function JamaahManagement() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "", address: "" });
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

  const handleApprove = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "approved" })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Jamaah berhasil disetujui",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyetujui jamaah",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: "rejected" })
        .eq("id", profileId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Pendaftaran jamaah ditolak",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menolak jamaah",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedProfile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          address: editForm.address,
        })
        .eq("id", selectedProfile.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data jamaah berhasil diperbarui",
      });
      setShowEditDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui data jamaah",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedProfile) return;

    try {
      // Delete from auth.users will cascade to profiles due to foreign key
      const { error } = await supabase.auth.admin.deleteUser(selectedProfile.id);

      if (error) {
        // Fallback: just delete from profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", selectedProfile.id);
        
        if (profileError) throw profileError;
      }

      toast({
        title: "Berhasil",
        description: "Data jamaah berhasil dihapus",
      });
      setShowDeleteDialog(false);
      setSelectedProfile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus data jamaah",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (profile: Profile) => {
    setSelectedProfile(profile);
    setEditForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    });
    setShowEditDialog(true);
  };

  const filterByStatus = (status: string) => {
    return profiles.filter((profile) => {
      const matchesStatus = profile.status === status;
      const matchesSearch = profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const ProfileCard = ({ profile }: { profile: Profile }) => (
    <Card className="hover-lift">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 flex-shrink-0">
            <Users className="w-6 h-6 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold truncate">{profile.full_name || "Nama tidak tersedia"}</h3>
              {getStatusBadge(profile.status)}
            </div>
            <div className="space-y-1 mt-2 text-sm text-muted-foreground">
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {profile.phone}
                </span>
              )}
              {profile.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{profile.address}</span>
                </span>
              )}
              {profile.created_at && (
                <p className="text-xs">
                  Terdaftar: {format(new Date(profile.created_at), "dd MMMM yyyy", { locale: localeId })}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {profile.status === "pending" && (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleApprove(profile.id)}>
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleReject(profile.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => { setSelectedProfile(profile); setShowDetailDialog(true); }}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => openEditDialog(profile)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => { setSelectedProfile(profile); setShowDeleteDialog(true); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const pendingCount = profiles.filter(p => p.status === "pending").length;
  const approvedCount = profiles.filter(p => p.status === "approved").length;
  const rejectedCount = profiles.filter(p => p.status === "rejected").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-primary text-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-amiri">Kelola Jamaah</h1>
              <p className="text-foreground/80 mt-1">Manajemen data & persetujuan jamaah masjid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Persetujuan</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jamaah Aktif</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ditolak</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
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
                placeholder="Cari jamaah berdasarkan nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending" className="flex gap-2">
                  <Clock className="w-4 h-4" />
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approved ({approvedCount})
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex gap-2">
                  <XCircle className="w-4 h-4" />
                  Ditolak ({rejectedCount})
                </TabsTrigger>
              </TabsList>

              {loading ? (
                <p className="text-center text-muted-foreground py-8">Memuat data...</p>
              ) : (
                <>
                  <TabsContent value="pending" className="space-y-4 mt-4">
                    {filterByStatus("pending").length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Tidak ada jamaah menunggu persetujuan</p>
                    ) : (
                      <div className="grid gap-4">
                        {filterByStatus("pending").map((profile) => (
                          <ProfileCard key={profile.id} profile={profile} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="approved" className="space-y-4 mt-4">
                    {filterByStatus("approved").length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Belum ada jamaah yang disetujui</p>
                    ) : (
                      <div className="grid gap-4">
                        {filterByStatus("approved").map((profile) => (
                          <ProfileCard key={profile.id} profile={profile} />
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="rejected" className="space-y-4 mt-4">
                    {filterByStatus("rejected").length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Tidak ada jamaah yang ditolak</p>
                    ) : (
                      <div className="grid gap-4">
                        {filterByStatus("rejected").map((profile) => (
                          <ProfileCard key={profile.id} profile={profile} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-amiri">Detail Jamaah</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
                  <Users className="w-8 h-8 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedProfile.full_name || "-"}</h3>
                  {getStatusBadge(selectedProfile.status)}
                </div>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{selectedProfile.phone || "Tidak ada nomor telepon"}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{selectedProfile.address || "Tidak ada alamat"}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Terdaftar: {selectedProfile.created_at ? format(new Date(selectedProfile.created_at), "dd MMMM yyyy, HH:mm", { locale: localeId }) : "-"}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-amiri">Edit Data Jamaah</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">No. Telepon</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Alamat</Label>
              <Textarea
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Batal</Button>
            <Button onClick={handleEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Jamaah?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus data jamaah "{selectedProfile?.full_name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}