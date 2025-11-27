import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, DollarSign, Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Donation {
  id: string;
  donor_name: string | null;
  amount: number;
  category: string;
  status: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string | null;
}

export default function DonationsManagement() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data donasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600"><Check className="w-3 h-3 mr-1" />Terverifikasi</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const totalDonations = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const verifiedDonations = donations.filter(d => d.status === "verified").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative gradient-primary text-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold font-amiri">Donasi Online</h1>
          <p className="text-foreground/80 mt-1">Kelola donasi dari jamaah</p>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donasi</p>
                  <p className="text-2xl font-bold text-gold mt-2">
                    Rp {totalDonations.toLocaleString("id-ID")}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-gold" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Donatur</p>
                  <p className="text-2xl font-bold mt-2">{donations.length}</p>
                </div>
                <Heart className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gold-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terverifikasi</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{verifiedDonations}</p>
                </div>
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-gold-border">
          <CardHeader>
            <CardTitle className="font-amiri flex items-center gap-2">
              <Heart className="w-5 h-5 text-gold" />
              Daftar Donasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Memuat data...</p>
            ) : donations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada donasi</p>
            ) : (
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-gold/20">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30">
                        <Heart className="w-6 h-6 text-gold" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{donation.donor_name || "Anonim"}</p>
                          {getStatusBadge(donation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{donation.category}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {donation.created_at ? new Date(donation.created_at).toLocaleDateString("id-ID") : "-"}
                          {donation.payment_method && ` • ${donation.payment_method}`}
                        </p>
                        {donation.notes && (
                          <p className="text-xs text-muted-foreground italic mt-1">{donation.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gold">
                          Rp {Number(donation.amount).toLocaleString("id-ID")}
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
