import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function InputPemasukan() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("financial_transactions").insert([{
        type: "income",
        category: data.category,
        amount: parseFloat(data.amount),
        transaction_date: data.transaction_date,
        description: data.description,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
      toast({ title: "Berhasil", description: "Pemasukan berhasil ditambahkan" });
      navigate("/bendahara/dashboard");
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal", 
        description: error.message || "Gagal menambahkan pemasukan",
        variant: "destructive"
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/bendahara/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Input Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Contoh: Donasi Rutin, Infaq Jumat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="500000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_date">Tanggal</Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Keterangan</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan tambahan (opsional)"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Menyimpan..." : "Simpan Pemasukan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
