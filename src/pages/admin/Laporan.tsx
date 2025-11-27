import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsResult, donationsResult] = await Promise.all([
        supabase.from("financial_transactions").select("*").order("transaction_date", { ascending: false }),
        supabase.from("donations").select("*").eq("status", "verified").order("created_at", { ascending: false })
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (donationsResult.error) throw donationsResult.error;

      setTransactions(transactionsResult.data || []);
      setDonations(donationsResult.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) + 
    donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-primary text-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold font-amiri">Laporan Keuangan</h1>
          <p className="text-foreground/80 mt-1">Transparansi keuangan masjid</p>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    Rp {totalIncome.toLocaleString("id-ID")}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    Rp {totalExpense.toLocaleString("id-ID")}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className="text-2xl font-bold text-gold mt-2">
                    Rp {balance.toLocaleString("id-ID")}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-gold-border">
          <CardHeader>
            <CardTitle className="font-amiri flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold" />
              Riwayat Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-gold/20">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === "income" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
                      }`}>
                        <DollarSign className={`w-5 h-5 ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">{transaction.description || "-"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(transaction.transaction_date).toLocaleDateString("id-ID")}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${
                      transaction.type === "income" ? "text-green-600" : "text-red-600"
                    }`}>
                      {transaction.type === "income" ? "+" : "-"}Rp {Number(transaction.amount).toLocaleString("id-ID")}
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
