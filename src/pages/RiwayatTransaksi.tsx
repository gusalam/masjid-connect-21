import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  Calendar,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string | null;
}

interface Donation {
  id: string;
  donor_name: string | null;
  amount: number;
  category: string;
  status: string | null;
  created_at: string | null;
}

type CombinedTransaction = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  source: "transaction" | "donation";
  status?: string | null;
};

export default function RiwayatTransaksi() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch financial transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["all-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Fetch verified donations
  const { data: donations = [] } = useQuery({
    queryKey: ["verified-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Donation[];
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const transactionsChannel = supabase
      .channel("riwayat-transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "financial_transactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
        }
      )
      .subscribe();

    const donationsChannel = supabase
      .channel("riwayat-donations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["verified-donations"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(donationsChannel);
    };
  }, [queryClient]);

  // Combine transactions and donations
  const combinedTransactions: CombinedTransaction[] = [
    ...transactions.map((t) => ({
      id: t.id,
      type: t.type as "income" | "expense",
      category: t.category,
      amount: Number(t.amount),
      description: t.description,
      date: t.transaction_date,
      source: "transaction" as const,
    })),
    ...donations
      .filter((d) => d.status === "verified")
      .map((d) => ({
        id: d.id,
        type: "income" as const,
        category: `Donasi - ${d.category}`,
        amount: Number(d.amount),
        description: d.donor_name ? `Dari: ${d.donor_name}` : "Anonim",
        date: d.created_at || new Date().toISOString(),
        source: "donation" as const,
        status: d.status,
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate totals
  const totalIncome = combinedTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = combinedTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) return null;
    if (status === "verified") {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Terverifikasi
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative gradient-primary text-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-foreground/80 hover:text-foreground hover:bg-foreground/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold font-amiri">Riwayat Transaksi</h1>
          <p className="text-foreground/80 mt-1">
            Seluruh riwayat transaksi keuangan masjid
          </p>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Uang Masuk</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Uang Keluar</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Akhir</p>
                  <p className="text-2xl font-bold text-gold mt-2">
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="p-3 bg-gold/10 border border-gold/30 rounded-xl">
                  <DollarSign className="w-6 h-6 text-gold" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-amiri flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              Semua Transaksi ({combinedTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {combinedTransactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {combinedTransactions.map((transaction) => (
                  <div
                    key={`${transaction.source}-${transaction.id}`}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-gold/20 hover:border-gold/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          transaction.type === "income"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.category}</p>
                          {transaction.source === "donation" && (
                            <Badge variant="secondary" className="text-xs">
                              Donasi
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || "-"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(transaction.date), "d MMMM yyyy", {
                              locale: localeId,
                            })}
                          </p>
                          {transaction.status && getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {transaction.type === "income" ? "Masuk" : "Keluar"}
                      </p>
                    </div>
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
