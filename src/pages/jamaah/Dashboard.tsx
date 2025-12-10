import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, FileText, Clock, Bell, User, DollarSign, BookOpen, TrendingUp, TrendingDown, Wallet, CheckCircle, XCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  status: string;
}

interface Donation {
  id: string;
  amount: number;
  category: string;
  status: string;
  created_at: string;
}

interface Activity {
  id: string;
  title: string;
  activity_date: string;
  activity_time: string | null;
  location: string | null;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  priority: string;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function JamaahDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, unreadCount } = useNotifications();

  useEffect(() => {
    fetchData();

    // Real-time subscriptions
    const profileChannel = supabase
      .channel('jamaah-profile-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchProfile)
      .subscribe();

    const donationChannel = supabase
      .channel('jamaah-donation-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, fetchDonations)
      .subscribe();

    const activityChannel = supabase
      .channel('jamaah-activity-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, fetchActivities)
      .subscribe();

    const announcementChannel = supabase
      .channel('jamaah-announcement-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();

    const financialChannel = supabase
      .channel('jamaah-financial-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_transactions' }, fetchFinancialSummary)
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(donationChannel);
      supabase.removeChannel(activityChannel);
      supabase.removeChannel(announcementChannel);
      supabase.removeChannel(financialChannel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProfile(),
      fetchDonations(),
      fetchActivities(),
      fetchAnnouncements(),
      fetchFinancialSummary()
    ]);
    setLoading(false);
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  };

  const fetchDonations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setDonations(data);
    }
  };

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .gte('activity_date', new Date().toISOString())
      .order('activity_date', { ascending: true })
      .limit(5);

    if (!error && data) {
      setActivities(data);
    }
  };

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setAnnouncements(data);
    }
  };

  const fetchFinancialSummary = async () => {
    // Get income from financial_transactions
    const { data: incomeData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'income');

    // Get expense from financial_transactions
    const { data: expenseData } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'expense');

    // Get verified donations
    const { data: donationData } = await supabase
      .from('donations')
      .select('amount')
      .eq('status', 'verified');

    const totalIncome = (incomeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0) +
      (donationData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0);
    const totalExpense = expenseData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    setFinancialSummary({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa kembali!"
    });
    navigate('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Aktif</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Terverifikasi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-amiri">Assalamu'alaikum, {profile?.full_name || 'Jamaah'}</h1>
              <p className="text-primary-foreground/80 mt-1">Selamat beraktivitas di hari yang penuh berkah.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="relative">
                <Bell className="w-4 h-4 mr-2" />
                Notifikasi
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Link to="/jamaah/profil">
                <Button variant="secondary" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Status Card */}
        <Card className="border-2 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status Akun</p>
                  {getStatusBadge(profile?.status || 'pending')}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Donasi Saya</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(totalDonations)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kas Masjid Masuk</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(financialSummary.totalIncome)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kas Masjid Keluar</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(financialSummary.totalExpense)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-full">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Kas</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(financialSummary.balance)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kegiatan Mendatang</p>
                <p className="text-lg font-bold text-purple-600">{activities.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/jamaah/donasi">
            <Button size="lg" className="w-full h-24 gradient-primary text-primary-foreground font-semibold flex-col gap-2">
              <Heart className="w-6 h-6" />
              Donasi Sekarang
            </Button>
          </Link>
          <Link to="/riwayat-transaksi">
            <Button size="lg" variant="outline" className="w-full h-24 border-2 font-semibold flex-col gap-2">
              <FileText className="w-6 h-6" />
              Lihat Laporan Keuangan
            </Button>
          </Link>
          <Link to="/kegiatan">
            <Button size="lg" variant="outline" className="w-full h-24 border-2 font-semibold flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              Kajian & Kegiatan
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Kegiatan Mendatang
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Belum ada kegiatan mendatang</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg hover-lift">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.activity_date), "EEEE, dd MMMM yyyy", { locale: localeId })}
                        </p>
                        {activity.activity_time && (
                          <p className="text-sm text-primary font-medium mt-1">{activity.activity_time} WIB</p>
                        )}
                        {activity.location && (
                          <p className="text-xs text-muted-foreground">{activity.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Riwayat Donasi Saya
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Belum ada riwayat donasi</p>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{donation.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(donation.created_at), "dd MMM yyyy", { locale: localeId })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(donation.amount)}</p>
                        {getStatusBadge(donation.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/jamaah/riwayat-donasi">
                <Button variant="outline" className="w-full mt-4">
                  Lihat Semua Riwayat
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Latest Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Pengumuman Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Belum ada pengumuman</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{announcement.title}</p>
                          {announcement.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">Penting</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(announcement.created_at), "dd MMMM yyyy", { locale: localeId })}
                        </p>
                      </div>
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