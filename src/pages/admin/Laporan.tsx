import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, TrendingUp, TrendingDown, ArrowLeft, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  transaction_date: string;
}

interface Donation {
  id: string;
  donor_name: string | null;
  amount: number;
  category: string;
  status: string | null;
  created_at: string | null;
}

export default function FinancialReports() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["laporan-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });

  const { data: donations = [], isLoading: loadingDonations } = useQuery({
    queryKey: ["laporan-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "verified")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Donation[];
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const transactionsChannel = supabase
      .channel("laporan-transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "financial_transactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["laporan-transactions"] });
        }
      )
      .subscribe();

    const donationsChannel = supabase
      .channel("laporan-donations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["laporan-donations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(donationsChannel);
    };
  }, [queryClient]);

  const loading = loadingTransactions || loadingDonations;

  // Calculate totals including verified donations as income
  const transactionIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const donationIncome = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  
  const totalIncome = transactionIncome + donationIncome;

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Recent transactions (last 10)
  const recentTransactions = transactions.slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-primary text-foreground p-4 sm:p-6 shadow-lg">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-3 sm:mb-4 text-foreground/80 hover:text-foreground hover:bg-foreground/10 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold font-amiri">Laporan Keuangan</h1>
          <p className="text-foreground/80 mt-1 text-sm sm:text-base">Transparansi keuangan masjid - Data real-time dari database</p>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Pemasukan</p>
                  <p className="text-sm sm:text-2xl font-bold text-green-600 mt-1 sm:mt-2">
                    {formatCurrency(totalIncome)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{donations.length} donasi</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 rounded-xl hidden sm:block">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Pengeluaran</p>
                  <p className="text-sm sm:text-2xl font-bold text-red-600 mt-1 sm:mt-2">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900/20 rounded-xl hidden sm:block">
                  <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-4 sm:pt-6 px-2 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2">
                <div className="text-center sm:text-left">
                  <p className="text-xs sm:text-sm text-muted-foreground">Saldo</p>
                  <p className="text-sm sm:text-2xl font-bold text-gold mt-1 sm:mt-2">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-gold/10 border border-gold/30 rounded-xl hidden sm:block">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-6">
            <CardTitle className="font-amiri flex items-center gap-2 text-base sm:text-xl">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              Transaksi Terbaru
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/riwayat-transaksi')} className="border-gold/30 hover:border-gold/50 text-xs sm:text-sm">
              <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-muted/30 rounded-lg border border-gold/20 gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        transaction.type === "income" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                      }`}>
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{transaction.category}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.description || "-"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.transaction_date), "d MMM yyyy", { locale: localeId })}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm sm:text-base whitespace-nowrap ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}{formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
