import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, FileText, PlusCircle, CheckCircle, LogOut, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function BendaharaDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch financial stats
  const { data: transactions } = useQuery({
    queryKey: ["financial-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch pending donations
  const { data: pendingDonations } = useQuery({
    queryKey: ["pending-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch verified donations for financial calculation
  const { data: verifiedDonations } = useQuery({
    queryKey: ["verified-donations-bendahara"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("status", "verified");
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscriptions
  useEffect(() => {
    const transactionsChannel = supabase
      .channel("bendahara-transactions-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "financial_transactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["financial-transactions"] });
        }
      )
      .subscribe();

    const donationsChannel = supabase
      .channel("bendahara-donations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-donations"] });
          queryClient.invalidateQueries({ queryKey: ["verified-donations-bendahara"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(donationsChannel);
    };
  }, [queryClient]);

  // Calculate stats - include verified donations as income
  const transactionIncome = transactions
    ?.filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  
  const donationIncome = verifiedDonations
    ?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  const totalIncome = transactionIncome + donationIncome;

  const totalExpense = transactions
    ?.filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const balance = totalIncome - totalExpense;

  const recentIncome = transactions
    ?.filter((t) => t.type === "income")
    .slice(0, 4) || [];

  const recentExpense = transactions
    ?.filter((t) => t.type === "expense")
    .slice(0, 4) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive",
      });
    } else {
      toast({ title: "Berhasil", description: "Logout berhasil" });
      navigate("/login");
    }
  };

  const handleVerifyDonation = async (donationId: string) => {
    const { error } = await supabase
      .from("donations")
      .update({ 
        status: "verified", 
        verified_at: new Date().toISOString(),
        verified_by: (await supabase.auth.getUser()).data.user?.id 
      })
      .eq("id", donationId);

    if (error) {
      toast({
        title: "Error",
        description: "Gagal verifikasi donasi",
        variant: "destructive",
      });
    } else {
      toast({ title: "Berhasil", description: "Donasi berhasil diverifikasi" });
      queryClient.invalidateQueries({ queryKey: ["pending-donations"] });
    }
  };

  const stats = [
    { icon: DollarSign, label: "Saldo Kas", value: formatCurrency(balance), change: "Saldo saat ini" },
    { icon: TrendingUp, label: "Total Pemasukan", value: formatCurrency(totalIncome), change: "Total" },
    { icon: TrendingDown, label: "Total Pengeluaran", value: formatCurrency(totalExpense), change: "Total" },
    { icon: FileText, label: "Donasi Pending", value: String(pendingDonations?.length || 0), change: "Perlu verifikasi" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-primary text-primary-foreground p-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Bendahara</h1>
            <p className="text-primary-foreground/80 mt-1">Kelola keuangan masjid dengan mudah dan transparan.</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover-lift">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-primary mt-1">{stat.change}</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            size="lg" 
            className="h-20 gradient-primary text-primary-foreground font-semibold"
            onClick={() => navigate("/bendahara/input-pemasukan")}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Input Pemasukan
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-20 border-2 font-semibold"
            onClick={() => navigate("/bendahara/input-pengeluaran")}
          >
            <TrendingDown className="w-5 h-5 mr-2" />
            Input Pengeluaran
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-20 border-2 font-semibold"
            onClick={() => navigate("/bendahara/inventaris")}
          >
            <Package className="w-5 h-5 mr-2" />
            Kelola Inventaris
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="h-20 border-2 font-semibold"
            onClick={() => navigate("/bendahara/buat-laporan")}
          >
            <FileText className="w-5 h-5 mr-2" />
            Buat Laporan
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Pemasukan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIncome.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada data pemasukan</p>
                ) : (
                  recentIncome.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.transaction_date), "d MMM yyyy", { locale: id })}
                        </p>
                      </div>
                      <p className="font-bold text-green-600 dark:text-green-400">+{formatCurrency(Number(transaction.amount))}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                Pengeluaran Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExpense.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada data pengeluaran</p>
                ) : (
                  recentExpense.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{transaction.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.transaction_date), "d MMM yyyy", { locale: id })}
                        </p>
                      </div>
                      <p className="font-bold text-red-600 dark:text-red-400">-{formatCurrency(Number(transaction.amount))}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Donations */}
        <Card>
          <CardHeader>
            <CardTitle>Donasi Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!pendingDonations || pendingDonations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Tidak ada donasi yang perlu diverifikasi</p>
              ) : (
                pendingDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.donor_name || "Anonim"}</p>
                        <p className="text-sm text-muted-foreground">
                          {donation.payment_method} • {formatCurrency(Number(donation.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(donation.created_at!), "d MMM yyyy • HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="default" onClick={() => handleVerifyDonation(donation.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verifikasi
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
