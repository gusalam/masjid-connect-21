import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, FileText, Clock, Bell, User, DollarSign, BookOpen } from "lucide-react";

export default function JamaahDashboard() {
  const upcomingEvents = [
    { title: "Kajian Ramadhan", date: "Jumat, 15 Mei 2024", time: "19:00 WIB" },
    { title: "Tarawih Berjamaah", date: "Setiap Malam", time: "20:00 WIB" },
    { title: "Kultum Subuh", date: "Setiap Hari", time: "04:45 WIB" },
  ];

  const prayerTimes = [
    { name: "Subuh", time: "04:30", passed: true },
    { name: "Dzuhur", time: "12:05", passed: true },
    { name: "Ashar", time: "15:30", passed: false },
    { name: "Maghrib", time: "18:20", passed: false },
    { name: "Isya", time: "19:40", passed: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Assalamu'alaikum, Ahmad</h1>
              <p className="text-primary-foreground/80 mt-1">Selamat beraktivitas di hari yang penuh berkah.</p>
            </div>
            <Button variant="secondary" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profil
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Prayer Times */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Jadwal Sholat Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {prayerTimes.map((prayer, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-center transition-all ${
                    prayer.passed
                      ? "bg-muted/50 opacity-60"
                      : "bg-primary/10 border-2 border-primary/30 font-bold"
                  }`}
                >
                  <p className="text-sm text-muted-foreground mb-1">{prayer.name}</p>
                  <p className="text-2xl font-bold text-foreground">{prayer.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button size="lg" className="h-24 gradient-primary text-primary-foreground font-semibold flex-col gap-2">
            <Heart className="w-6 h-6" />
            Donasi Sekarang
          </Button>
          <Button size="lg" variant="outline" className="h-24 border-2 font-semibold flex-col gap-2">
            <FileText className="w-6 h-6" />
            Lihat Laporan
          </Button>
          <Button size="lg" variant="outline" className="h-24 border-2 font-semibold flex-col gap-2">
            <BookOpen className="w-6 h-6" />
            Kajian & Kegiatan
          </Button>
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
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg hover-lift">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <p className="text-sm text-primary font-medium mt-1">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">Donasi Rutin</p>
                      <p className="text-sm text-muted-foreground">10 Mei 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">Rp 100.000</p>
                      <p className="text-xs text-green-600 font-medium">Terverifikasi</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Lihat Semua Riwayat
              </Button>
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
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Perubahan Jadwal Kajian</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Kajian rutin hari Jumat dipindah dari pukul 19:00 menjadi 20:00 WIB mulai minggu depan.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">2 hari yang lalu</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
