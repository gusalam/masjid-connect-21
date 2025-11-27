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
    type: "financial",
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

  const { data: donations } = useQuery({
    queryKey: ["donations", formData.period_start, formData.period_end],
    queryFn: async () => {
      if (!formData.period_start || !formData.period_end) return [];
      
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "verified")
        .gte("created_at", formData.period_start)
        .lte("created_at", formData.period_end)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!formData.period_start && !!formData.period_end,
  });

  const totalIncome = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const totalDonations = donations
    ?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  const totalExpense = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const balance = (totalIncome + totalDonations) - totalExpense;

  // Category breakdowns
  const incomeByCategory = transactions
    ?.filter((t) => t.type === "income")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>) || {};

  const expenseByCategory = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>) || {};

  const donationByCategory = donations
    ?.reduce((acc, d) => {
      acc[d.category] = (acc[d.category] || 0) + Number(d.amount);
      return acc;
    }, {} as Record<string, number>) || {};

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const reportContent = {
        summary: {
          total_income: totalIncome,
          total_donations: totalDonations,
          total_expense: totalExpense,
          balance: balance,
          transaction_count: transactions?.length || 0,
          donation_count: donations?.length || 0,
        },
        breakdown: {
          income_by_category: incomeByCategory,
          expense_by_category: expenseByCategory,
          donation_by_category: donationByCategory,
        },
        transactions: transactions,
        donations: donations,
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
    if ((!transactions || transactions.length === 0) && (!donations || donations.length === 0)) {
      toast({
        title: "Peringatan",
        description: "Tidak ada transaksi atau donasi dalam periode ini",
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

              {(transactions && transactions.length > 0 || donations && donations.length > 0) && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Ringkasan Laporan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Pemasukan (Transaksi):</span>
                        <span className="font-bold text-green-600">{formatCurrency(totalIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Donasi:</span>
                        <span className="font-bold text-green-600">{formatCurrency(totalDonations)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-semibold text-muted-foreground">Total Pemasukan Keseluruhan:</span>
                        <span className="font-bold text-primary">{formatCurrency(totalIncome + totalDonations)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Total Pengeluaran:</span>
                      <span className="font-bold text-destructive">{formatCurrency(totalExpense)}</span>
                    </div>
                    
                    <div className="flex justify-between pt-3 border-t-2">
                      <span className="font-semibold text-lg">Saldo Akhir:</span>
                      <span className={`font-bold text-lg ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
                        {formatCurrency(balance)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transaksi:</span>
                        <span className="font-semibold">{transactions?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Donasi:</span>
                        <span className="font-semibold">{donations?.length || 0}</span>
                      </div>
                    </div>

                    {Object.keys(incomeByCategory).length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="font-semibold mb-2">Pemasukan per Kategori:</p>
                        <div className="space-y-1">
                          {Object.entries(incomeByCategory).map(([category, amount]) => (
                            <div key={category} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{category}:</span>
                              <span className="font-medium">{formatCurrency(amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(donationByCategory).length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="font-semibold mb-2">Donasi per Kategori:</p>
                        <div className="space-y-1">
                          {Object.entries(donationByCategory).map(([category, amount]) => (
                            <div key={category} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{category}:</span>
                              <span className="font-medium">{formatCurrency(amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(expenseByCategory).length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="font-semibold mb-2">Pengeluaran per Kategori:</p>
                        <div className="space-y-1">
                          {Object.entries(expenseByCategory).map(([category, amount]) => (
                            <div key={category} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{category}:</span>
                              <span className="font-medium">{formatCurrency(amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
