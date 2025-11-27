import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function AssetsList() {
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

  const totalValue = assets?.reduce((sum, asset) => {
    return sum + (parseFloat(asset.purchase_price?.toString() || "0") || 0);
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Item</div>
            <div className="text-2xl font-bold">{assets?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Jumlah</div>
            <div className="text-2xl font-bold">
              {assets?.reduce((sum, asset) => sum + asset.quantity, 0) || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Nilai</div>
            <div className="text-2xl font-bold">
              Rp {totalValue.toLocaleString('id-ID')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Daftar Inventaris
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
            <p className="text-center text-muted-foreground py-8">Belum ada data inventaris</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}