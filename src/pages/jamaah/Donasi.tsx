import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const DONATION_CATEGORIES = [
  "Infaq Jumat",
  "Zakat",
  "Sedekah",
  "Pembangunan Masjid",
  "Yatim Piatu",
  "Operasional Masjid",
  "Lainnya"
];

const PAYMENT_METHODS = [
  "Transfer Bank",
  "Tunai",
  "E-Wallet"
];

export default function JamaahDonasi() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    payment_method: "",
    notes: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Silakan login terlebih dahulu"
      });
      navigate('/login');
      return;
    }

    // Get user profile for donor name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { error } = await supabase.from('donations').insert({
      donor_id: user.id,
      donor_name: profile?.full_name || user.email,
      amount: Number(formData.amount),
      category: formData.category,
      payment_method: formData.payment_method,
      notes: formData.notes,
      status: 'pending'
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengirim donasi. Silakan coba lagi."
      });
    } else {
      setSubmitted(true);
      toast({
        title: "Donasi Terkirim",
        description: "Terima kasih! Donasi Anda sedang diproses."
      });
    }
    setLoading(false);
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(Number(number));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 shadow-lg">
          <div className="container mx-auto">
            <div className="flex items-center gap-4">
              <Link to="/jamaah/dashboard">
                <Button variant="secondary" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold font-amiri">Donasi</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-6 max-w-md">
          <Card className="text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Donasi Berhasil Dikirim!</h2>
              <p className="text-muted-foreground">
                Terima kasih atas donasi Anda. Tim kami akan segera memverifikasi pembayaran Anda.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg text-left">
                <p className="text-sm text-muted-foreground">Detail Donasi:</p>
                <p className="font-bold text-lg">Rp {formatCurrency(formData.amount)}</p>
                <p className="text-sm">{formData.category}</p>
                <p className="text-sm text-muted-foreground">{formData.payment_method}</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Link to="/jamaah/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Kembali ke Dashboard
                  </Button>
                </Link>
                <Button 
                  className="flex-1" 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ amount: "", category: "", payment_method: "", notes: "" });
                  }}
                >
                  Donasi Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <h1 className="text-3xl font-bold font-amiri">Donasi</h1>
              <p className="text-primary-foreground/80 mt-1">Berbagi kebaikan untuk masjid</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-md">
        <Card className="card-gold-border">
          <CardHeader>
            <CardTitle className="font-amiri flex items-center gap-2">
              <Heart className="w-5 h-5 text-gold" />
              Form Donasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal Donasi *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="0"
                    className="pl-10"
                    value={formatCurrency(formData.amount)}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori Donasi *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {DONATION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Metode Pembayaran *</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.amount || !formData.category || !formData.payment_method}
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Mengirim..." : "Kirim Donasi"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Informasi Pembayaran:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Transfer Bank: BRI 1234567890 a.n. Masjid Al-Ikhlas</li>
                <li>Tunai: Datang langsung ke sekretariat masjid</li>
                <li>E-Wallet: Hubungi admin untuk QR Code</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}