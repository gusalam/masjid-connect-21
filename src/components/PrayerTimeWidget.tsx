import { useState, useEffect } from "react";
import { Clock, Moon, Star } from "lucide-react";

interface PrayerTime {
  name: string;
  time: string;
}

export default function PrayerTimeWidget() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [countdown, setCountdown] = useState("");

  // Jadwal sholat (static untuk demo, bisa diganti dengan API)
  const prayerTimes: PrayerTime[] = [
    { name: "Subuh", time: "04:45" },
    { name: "Dzuhur", time: "12:05" },
    { name: "Ashar", time: "15:30" },
    { name: "Maghrib", time: "18:15" },
    { name: "Isya", time: "19:30" },
  ];

  // Fungsi untuk mencari waktu sholat berikutnya
  const findNextPrayer = (now: Date) => {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayerTimes) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        return prayer;
      }
    }

    // Jika sudah lewat semua waktu sholat hari ini, return Subuh besok
    return prayerTimes[0];
  };

  // Fungsi untuk menghitung countdown
  const calculateCountdown = (now: Date, prayer: PrayerTime) => {
    const [hours, minutes] = prayer.time.split(":").map(Number);
    let targetDate = new Date(now);
    targetDate.setHours(hours, minutes, 0, 0);

    // Jika waktu sholat sudah lewat hari ini, set ke besok
    if (targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    const diff = targetDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hoursLeft.toString().padStart(2, "0")}:${minutesLeft
      .toString()
      .padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`;
  };

  // Update waktu setiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const next = findNextPrayer(now);
      setNextPrayer(next);

      if (next) {
        setCountdown(calculateCountdown(now, next));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format waktu saat ini
  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="inline-flex flex-col items-center gap-3 bg-card/60 backdrop-blur-md px-8 py-5 rounded-2xl shadow-xl border border-gold/20 card-gold-border min-w-[300px]">
      {/* Jam Digital */}
      <div className="flex items-center gap-3 border-b border-gold/20 pb-3 w-full justify-center">
        <Clock className="w-6 h-6 text-secondary animate-pulse" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Waktu Sekarang</div>
          <div className="text-2xl font-bold text-secondary font-mono tabular-nums">
            {formatCurrentTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Waktu Sholat Berikutnya */}
      <div className="flex items-center gap-4 w-full">
        <Moon className="w-6 h-6 text-gold" />
        <div className="flex-1">
          <div className="text-sm text-muted-foreground">Sholat Berikutnya</div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-xl text-gold font-amiri">
              {nextPrayer?.name}
            </span>
            <span className="text-base text-foreground">
              {nextPrayer?.time}
            </span>
          </div>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-3 bg-gold/10 px-4 py-2 rounded-lg border border-gold/30 w-full justify-center">
        <div className="flex gap-1">
          <Star className="w-4 h-4 text-gold animate-pulse" />
          <Star className="w-4 h-4 text-gold animate-pulse" style={{ animationDelay: "0.3s" }} />
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground mb-1">Menuju Sholat</div>
          <div className="text-2xl font-bold text-gold font-mono tabular-nums tracking-wider">
            {countdown}
          </div>
        </div>
        <div className="flex gap-1">
          <Star className="w-4 h-4 text-gold animate-pulse" style={{ animationDelay: "0.6s" }} />
          <Star className="w-4 h-4 text-gold animate-pulse" style={{ animationDelay: "0.9s" }} />
        </div>
      </div>
    </div>
  );
}
