import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function BuatLaporan() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: "",
    period_start: "",
    period_end: "",
    type: "monthly",
  });

  const { data: transactions } = useQuery({
    queryKey: ["financial-transactions", formData.period_start, formData.period_end],
    queryFn: async () => {
      if (!formData.period_start || !formData.period_end) return [];
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .gte("transaction_date", formData.period_start)
        .lte("transaction_date", formData.period_end)
        .order("transaction_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.period_start && !!formData.period_end,
  });

  const totalIncome = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const totalExpense = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const balance = totalIncome - totalExpense;

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const reportContent = {
        summary: {
          total_income: totalIncome,
          total_expense: totalExpense,
          balance: balance,
          transaction_count: transactions?.length || 0,
        },
        transactions: transactions,
      };

      const { error } = await supabase.from("reports").insert([{
        title: data.title,
        type: data.type,
        period_start: data.period_start,
        period_end: data.period_end,
        content: reportContent,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({ title: "Berhasil", description: "Laporan berhasil dibuat" });
      navigate("/bendahara/dashboard");
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal", 
        description: error.message || "Gagal membuat laporan",
        variant: "destructive"
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactions || transactions.length === 0) {
      toast({
        title: "Peringatan",
        description: "Tidak ada transaksi dalam periode ini",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/bendahara/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Buat Laporan Keuangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Laporan</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Laporan Keuangan Januari 2025"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period_start">Periode Mulai</Label>
                  <Input
                    id="period_start"
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period_end">Periode Selesai</Label>
                  <Input
                    id="period_end"
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    required
                  />
                </div>
              </div>

              {transactions && transactions.length > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Ringkasan Laporan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pemasukan:</span>
                      <span className="font-bold text-primary">{formatCurrency(totalIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pengeluaran:</span>
                      <span className="font-bold text-destructive">{formatCurrency(totalExpense)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="font-semibold">Saldo:</span>
                      <span className={`font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jumlah Transaksi:</span>
                      <span className="font-semibold">{transactions.length}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Membuat Laporan..." : "Buat Laporan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
