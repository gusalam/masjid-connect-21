import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, Package, Settings, FileText, Image, Bell, Moon, Star, Sparkles, LogOut, ClipboardList, TrendingUp, TrendingDown, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Stats {
  totalJamaah: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  kegiatanAktif: number;
  totalAset: number;
}

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
  created_at: string;
}

type CombinedTransaction = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string | null;
  date: string;
  source: "transaction" | "donation";
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalJamaah: 0,
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    kegiatanAktif: 0,
    totalAset: 0
  });
  const [recentActivities, setRecentActivities] = useState<{ id: string; title: string; activity_date: string; activity_time: string }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<CombinedTransaction[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
    fetchRecentTransactions();

    // Real-time subscriptions
    const activitiesChannel = supabase
      .channel('admin-activities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        fetchStats();
        fetchRecentActivities();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('admin-transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, () => {
        fetchStats();
        fetchRecentTransactions();
      })
      .subscribe();

    const donationsChannel = supabase
      .channel('admin-donations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
        fetchStats();
        fetchRecentTransactions();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchStats();
      })
      .subscribe();

    const assetsChannel = supabase
      .channel('admin-assets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(donationsChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(assetsChannel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const [profilesRes, transactionsRes, donationsRes, activitiesRes, assetsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('financial_transactions').select('amount, type'),
        supabase.from('donations').select('amount, status').eq('status', 'verified'),
        supabase.from('activities').select('id', { count: 'exact', head: true }),
        supabase.from('assets').select('id', { count: 'exact', head: true })
      ]);

      // Calculate income from transactions
      const transactionIncome = transactionsRes.data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const transactionExpense = transactionsRes.data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      // Add verified donations to income
      const donationIncome = donationsRes.data?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      
      const totalIncome = transactionIncome + donationIncome;
      const totalExpense = transactionExpense;
      const balance = totalIncome - totalExpense;

      setStats({
        totalJamaah: profilesRes.count || 0,
        totalIncome,
        totalExpense,
        balance,
        kegiatanAktif: activitiesRes.count || 0,
        totalAset: assetsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('id, title, activity_date, activity_time')
        .order('activity_date', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const [transactionsRes, donationsRes] = await Promise.all([
        supabase.from('financial_transactions').select('*').order('transaction_date', { ascending: false }).limit(5),
        supabase.from('donations').select('*').eq('status', 'verified').order('created_at', { ascending: false }).limit(5)
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (donationsRes.error) throw donationsRes.error;

      const transactions: CombinedTransaction[] = (transactionsRes.data || []).map((t: Transaction) => ({
        id: t.id,
        type: t.type as "income" | "expense",
        category: t.category,
        amount: Number(t.amount),
        description: t.description,
        date: t.transaction_date,
        source: "transaction" as const
      }));

      const donations: CombinedTransaction[] = (donationsRes.data || []).map((d: Donation) => ({
        id: d.id,
        type: "income" as const,
        category: `Donasi - ${d.category}`,
        amount: Number(d.amount),
        description: d.donor_name ? `Dari: ${d.donor_name}` : "Anonim",
        date: d.created_at,
        source: "donation" as const
      }));

      const combined = [...transactions, ...donations]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setRecentTransactions(combined);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout Berhasil",
        description: "Sampai jumpa kembali!"
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout Gagal",
        description: error.message
      });
    }
  };
  
  const statsDisplay = [
    { icon: DollarSign, label: "Saldo Kas", value: formatCurrency(stats.balance), change: "Real-time", color: "gold", clickable: true, link: "/riwayat-transaksi" },
    { icon: TrendingUp, label: "Total Pemasukan", value: formatCurrency(stats.totalIncome), change: "Termasuk donasi", color: "secondary", clickable: true, link: "/riwayat-transaksi" },
    { icon: TrendingDown, label: "Total Pengeluaran", value: formatCurrency(stats.totalExpense), change: "Real-time", color: "accent", clickable: true, link: "/riwayat-transaksi" },
    { icon: Package, label: "Total Aset", value: stats.totalAset.toString(), change: "Inventaris", color: "gold", clickable: true, link: "/admin/inventaris" },
  ];

  const quickActions = [
    { icon: Users, label: "Kelola Jamaah", color: "bg-primary", path: "/admin/jamaah" },
    { icon: Bell, label: "Pengumuman", color: "bg-secondary", path: "/admin/pengumuman" },
    { icon: History, label: "Riwayat Transaksi", color: "bg-gold", path: "/riwayat-transaksi" },
    { icon: ClipboardList, label: "Laporan Bendahara", color: "bg-accent", path: "/admin/laporan-bendahara" },
    { icon: FileText, label: "Laporan Transparan", color: "bg-accent", path: "/admin/laporan" },
    { icon: DollarSign, label: "Kelola Donatur", color: "bg-secondary", path: "/admin/donasi-cms" },
    { icon: Image, label: "Upload Galeri", color: "bg-gold", path: "/admin/galeri" },
    { icon: Settings, label: "Profil Masjid", color: "bg-muted-foreground", path: "/admin/profil-masjid" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative gradient-primary text-foreground p-6 shadow-lg overflow-hidden">
        <div className="absolute inset-0 stars-pattern opacity-20" />
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <Star className="absolute top-4 right-10 w-5 h-5 text-gold animate-pulse opacity-60" />
        <Star className="absolute bottom-4 right-32 w-4 h-4 text-gold animate-pulse opacity-40" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Moon className="w-8 h-8 text-gold animate-pulse" />
                <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold font-amiri">Dashboard Admin</h1>
              <p className="text-foreground/80 mt-1">
                السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ - Kelola seluruh sistem masjid di sini
              </p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="border-gold/30 hover:border-gold/50 hover:bg-gold/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsDisplay.map((stat, index) => (
            <Card 
              key={index} 
              className={`hover-lift card-gold-border bg-card/60 backdrop-blur-sm ${stat.clickable ? 'cursor-pointer' : ''}`}
              onClick={() => stat.clickable && stat.link && navigate(stat.link)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold mt-2 font-amiri">{stat.value}</p>
                    <p className={`text-xs text-${stat.color} mt-1 flex items-center gap-1`}>
                      <Star className="w-3 h-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 bg-${stat.color}/10 border border-${stat.color}/30 rounded-xl`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-amiri flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => action.path !== "#" && navigate(action.path)}
                  className="h-24 flex flex-col gap-2 hover:border-gold/50 border-gold/30 bg-card/40 backdrop-blur-sm hover-lift"
                >
                  <div className={`p-2 ${action.color} rounded-lg`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-amiri flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" />
                Kegiatan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Belum ada kegiatan</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border border-gold/20 hover-lift">
                      <div className="w-10 h-10 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Moon className="w-3 h-3" />
                          {new Date(activity.activity_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • {activity.activity_time}
                        </p>
                      </div>
                      <Star className="w-4 h-4 text-gold animate-pulse" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border bg-card/60 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-amiri flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gold" />
                Transaksi Terbaru
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/riwayat-transaksi')} className="text-gold hover:text-gold/80">
                Lihat Semua
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Belum ada transaksi</p>
                ) : (
                  recentTransactions.map((transaction) => (
                    <div key={`${transaction.source}-${transaction.id}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-gold/20 hover-lift">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.date), 'd MMM yyyy', { locale: localeId })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
