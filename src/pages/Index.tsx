import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrayerTimeWidget from "@/components/PrayerTimeWidget";
import { 
  Building2, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Megaphone, 
  BookOpen,
  Sparkles,
  Moon,
  Star
} from "lucide-react";
import GalleryCarousel from "@/components/GalleryCarousel";
import AnnouncementsList from "@/components/AnnouncementsList";
import DonaturList from "@/components/DonaturList";

export default function Index() {
  const features = [
    {
      icon: Heart,
      title: "Donasi Online",
      description: "Kemudahan berdonasi kapan saja dengan sistem yang transparan dan aman.",
      path: "/donasi"
    },
    {
      icon: Calendar,
      title: "Jadwal Kegiatan",
      description: "Informasi lengkap kajian, acara, dan kegiatan masjid yang terorganisir.",
      path: "/kegiatan"
    },
    {
      icon: TrendingUp,
      title: "Laporan Transparan",
      description: "Transparansi penuh laporan keuangan masjid yang dapat diakses jamaah.",
      path: "/admin/laporan"
    },
    {
      icon: Megaphone,
      title: "Pengumuman",
      description: "Informasi dan pengumuman terbaru langsung dari pengurus masjid.",
      path: "#pengumuman"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section - Islamic Night Theme */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated Night Sky Background */}
        <div className="absolute inset-0 gradient-night">
          <div className="absolute inset-0 stars-pattern opacity-60 animate-pulse" />
          <div className="absolute inset-0 islamic-pattern opacity-20" />
        </div>
        
        {/* Mosque Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-navy-dark to-transparent opacity-80">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl">
            <svg viewBox="0 0 800 200" className="w-full h-auto opacity-40" fill="currentColor">
              <path d="M400 20 L420 60 L380 60 Z" className="text-navy-deep" />
              <rect x="370" y="60" width="60" height="140" className="text-navy-deep" />
              <circle cx="350" cy="100" r="25" className="text-navy-deep" />
              <circle cx="450" cy="100" r="25" className="text-navy-deep" />
              <path d="M300 80 L500 80 L520 200 L280 200 Z" className="text-navy-deep" />
              <rect x="380" y="120" width="40" height="80" className="text-midnight" />
            </svg>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        {/* Decorative Lanterns */}
        <div className="absolute top-32 left-10 opacity-60 animate-float">
          <div className="w-12 h-16 bg-gold/20 border-2 border-gold rounded-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-gold" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gold/40 rounded-full glow-gold" />
          </div>
        </div>
        <div className="absolute top-40 right-10 opacity-60 animate-float" style={{ animationDelay: "1s" }}>
          <div className="w-12 h-16 bg-gold/20 border-2 border-gold rounded-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-gold" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gold/40 rounded-full glow-gold" />
          </div>
        </div>

        {/* Crescent Moon & Stars */}
        <div className="absolute top-24 left-1/4">
          <div className="crescent-moon glow-gold animate-glow" />
          <Star className="absolute -right-8 top-2 w-4 h-4 text-gold animate-pulse" />
          <Star className="absolute -left-6 -bottom-4 w-3 h-3 text-gold animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-3 bg-card/40 backdrop-blur-md px-6 py-3 rounded-full border border-gold/30 glow-gold">
              <Building2 className="w-5 h-5 text-gold animate-pulse" />
              <span className="text-foreground font-medium">Masjid Al-Ikhlas</span>
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight font-amiri">
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              <span className="block mt-4 text-gradient-gold">
                Kelola Masjid dengan Mudah
              </span>
              <span className="block mt-2 text-4xl md:text-5xl text-gradient-sky">
                Transparan & Modern
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Platform lengkap untuk mengelola keuangan, kegiatan, dan administrasi masjid. 
              Sistem modern dengan nuansa Islami yang penuh berkah.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="font-semibold px-8 py-6 text-lg shadow-xl hover:scale-105 transition-transform bg-gold text-primary hover:bg-gold-light glow-gold">
                  <Moon className="w-5 h-5 mr-2" />
                  Mulai Sekarang
                </Button>
              </Link>
              <Link to="/tentang">
                <Button size="lg" variant="outline" className="font-semibold px-8 py-6 text-lg border-secondary/50 text-foreground hover:bg-secondary/10 hover:border-secondary">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>

            {/* Prayer Time Widget - Real-time */}
            <PrayerTimeWidget />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative">
        <div className="absolute inset-0 stars-pattern opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-gold" />
              <Sparkles className="w-5 h-5 text-secondary" />
              <Star className="w-5 h-5 text-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-amiri">
              Fitur <span className="text-gradient-gold">Unggulan</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Sistem lengkap yang memudahkan pengelolaan masjid Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} to={feature.path}>
                <Card 
                  className="hover-lift card-gold-border bg-card/60 backdrop-blur-sm group cursor-pointer h-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:glow-gold">
                      <feature.icon className="w-7 h-7 text-gold" />
                    </div>
                    <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <div id="pengumuman">
        <AnnouncementsList />
      </div>

      {/* Donatur Section */}
      <DonaturList />

      {/* Gallery Carousel Section */}
      <GalleryCarousel />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 stars-pattern opacity-30" />
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        
        {/* Floating Stars */}
        <Star className="absolute top-20 left-20 w-6 h-6 text-gold animate-pulse opacity-60" />
        <Star className="absolute top-40 right-32 w-4 h-4 text-gold animate-pulse opacity-40" style={{ animationDelay: "0.5s" }} />
        <Star className="absolute bottom-32 left-40 w-5 h-5 text-gold animate-pulse opacity-50" style={{ animationDelay: "1s" }} />
        <Star className="absolute bottom-20 right-20 w-6 h-6 text-gold animate-pulse opacity-60" style={{ animationDelay: "1.5s" }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="flex justify-center gap-2 mb-4">
              <Moon className="w-8 h-8 text-gold animate-pulse" />
              <Sparkles className="w-8 h-8 text-secondary animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground font-amiri">
              Siap Modernisasi Masjid Anda?
            </h2>
            <p className="text-xl text-muted-foreground">
              Bergabunglah dengan sistem pengelolaan masjid yang telah dipercaya oleh ratusan masjid di Indonesia. 
              Kelola dengan berkah, transparan, dan penuh amanah.
            </p>
            <Link to="/login">
              <Button size="lg" className="font-semibold px-8 py-6 text-lg shadow-xl hover:scale-105 transition-transform bg-gold text-primary hover:bg-gold-light glow-gold">
                <Building2 className="w-5 h-5 mr-2" />
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
