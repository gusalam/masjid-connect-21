import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, Package, Settings, FileText, Image, Bell, Moon, Star, Sparkles, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Stats {
  totalJamaah: number;
  totalKas: number;
  kegiatanAktif: number;
  totalAset: number;
}

interface Activity {
  id: string;
  title: string;
  activity_date: string;
  activity_time: string;
}

interface Donation {
  id: string;
  donor_name: string | null;
  amount: number;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalJamaah: 0,
    totalKas: 0,
    kegiatanAktif: 0,
    totalAset: 0
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
    fetchRecentDonations();

    // Real-time subscriptions
    const activitiesChannel = supabase
      .channel('activities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        fetchStats();
        fetchRecentActivities();
      })
      .subscribe();

    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, () => {
        fetchStats();
      })
      .subscribe();

    const donationsChannel = supabase
      .channel('donations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
        fetchRecentDonations();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchStats();
      })
      .subscribe();

    const assetsChannel = supabase
      .channel('assets-changes')
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
      const [profilesRes, transactionsRes, activitiesRes, assetsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('financial_transactions').select('amount, type'),
        supabase.from('activities').select('id', { count: 'exact', head: true }),
        supabase.from('assets').select('id', { count: 'exact', head: true })
      ]);

      // Calculate total kas: sum of income - sum of expenses
      const totalIncome = transactionsRes.data?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpense = transactionsRes.data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalKas = totalIncome - totalExpense;

      setStats({
        totalJamaah: profilesRes.count || 0,
        totalKas: totalKas,
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

  const fetchRecentDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('id, donor_name, amount, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
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
    { icon: Users, label: "Total Jamaah", value: stats.totalJamaah.toString(), change: "Real-time", color: "secondary", clickable: false },
    { icon: DollarSign, label: "Kas Masjid", value: `Rp ${stats.totalKas.toLocaleString('id-ID')}`, change: "Verified", color: "gold", clickable: false },
    { icon: Calendar, label: "Kegiatan Aktif", value: stats.kegiatanAktif.toString(), change: "Real-time", color: "accent", clickable: false },
    { icon: Package, label: "Total Aset", value: stats.totalAset.toString(), change: "Inventaris", color: "gold", clickable: true, link: "/admin/inventaris" },
  ];

  const quickActions = [
    { icon: Users, label: "Kelola Jamaah", color: "bg-secondary", path: "/admin/jamaah" },
    { icon: Calendar, label: "Tambah Kegiatan", color: "bg-accent", path: "/admin/kegiatan" },
    { icon: FileText, label: "Laporan Transparan", color: "bg-gold", path: "/admin/laporan" },
    { icon: DollarSign, label: "Donasi Online", color: "bg-secondary", path: "/admin/donasi" },
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <CardHeader>
              <CardTitle className="font-amiri flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gold" />
                Transaksi Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDonations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Belum ada donasi</p>
                ) : (
                  recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-gold/20 hover-lift">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="font-medium">{donation.donor_name || 'Anonim'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(donation.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold">+Rp {donation.amount.toLocaleString('id-ID')}</p>
                        <Star className="w-3 h-3 text-gold ml-auto animate-pulse" />
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
