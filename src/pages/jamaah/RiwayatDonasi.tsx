import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Donation {
  id: string;
  amount: number;
  category: string;
  payment_method: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export default function JamaahRiwayatDonasi() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDonations();

    // Real-time subscription
    const channel = supabase
      .channel('jamaah-donations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => {
        fetchDonations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDonations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat riwayat donasi"
      });
    } else {
      setDonations(data || []);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
      case "verified":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Terverifikasi</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalDonations = donations.filter(d => d.status === 'verified').reduce((sum, d) => sum + Number(d.amount), 0);
  const pendingDonations = donations.filter(d => d.status === 'pending').reduce((sum, d) => sum + Number(d.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/jamaah/dashboard">
              <Button variant="secondary" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-amiri">Riwayat Donasi</h1>
              <p className="text-primary-foreground/80 mt-1">Catatan donasi Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Donasi Terverifikasi</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalDonations)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingDonations)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation List */}
        <Card className="card-gold-border">
          <CardHeader>
            <CardTitle className="font-amiri flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gold" />
              Daftar Donasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : donations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Belum ada riwayat donasi</p>
                <Link to="/jamaah/donasi">
                  <Button>Mulai Berdonasi</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <Card key={donation.id} className="hover-lift">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{donation.category}</h3>
                            {getStatusBadge(donation.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(donation.created_at), "EEEE, dd MMMM yyyy - HH:mm", { locale: localeId })}
                          </p>
                          {donation.payment_method && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Metode: {donation.payment_method}
                            </p>
                          )}
                          {donation.notes && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{donation.notes}"
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">{formatCurrency(donation.amount)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}