import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Inventaris() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 1,
    purchase_date: "",
    purchase_price: "",
    location: "",
    condition: "baik",
    notes: "",
  });

  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addAssetMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("assets").insert({
        ...data,
        created_by: userData.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Aset berhasil ditambahkan");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        category: "",
        quantity: 1,
        purchase_date: "",
        purchase_price: "",
        location: "",
        condition: "baik",
        notes: "",
      });
    },
    onError: () => {
      toast.error("Gagal menambahkan aset");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAssetMutation.mutate({
      ...formData,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/bendahara/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inventaris Masjid</h1>
              <p className="text-muted-foreground">Kelola aset dan barang inventaris</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Aset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Aset Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Barang *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Contoh: Elektronik, Furniture"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Jumlah</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_date">Tanggal Pembelian</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">Harga Pembelian (Rp)</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      min="0"
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Lokasi</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Contoh: Ruang Utama"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Kondisi</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baik">Baik</SelectItem>
                        <SelectItem value="rusak ringan">Rusak Ringan</SelectItem>
                        <SelectItem value="rusak berat">Rusak Berat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Simpan</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Daftar Aset
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : assets && assets.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead>Kondisi</TableHead>
                      <TableHead>Harga Beli</TableHead>
                      <TableHead>Tanggal Beli</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset: any) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>{asset.category || "-"}</TableCell>
                        <TableCell>{asset.quantity}</TableCell>
                        <TableCell>{asset.location || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            asset.condition === "baik" 
                              ? "bg-green-100 text-green-800" 
                              : asset.condition === "rusak ringan"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {asset.condition || "baik"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {asset.purchase_price 
                            ? `Rp ${parseFloat(asset.purchase_price).toLocaleString('id-ID')}`
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {asset.purchase_date 
                            ? new Date(asset.purchase_date).toLocaleDateString('id-ID')
                            : "-"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Belum ada data aset</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}