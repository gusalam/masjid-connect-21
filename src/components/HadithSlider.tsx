import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Hadith {
  arabic?: string;
  indonesian: string;
  source: string;
}

const hadiths: Hadith[] = [
  {
    arabic: "صَلاَةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلاَةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً",
    indonesian: "Sholat berjamaah lebih utama dari sholat sendirian dengan dua puluh tujuh derajat.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "مَنْ بَنَى لِلَّهِ مَسْجِدًا بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ",
    indonesian: "Barangsiapa membangun masjid karena Allah, maka Allah akan membangunkan untuknya rumah di surga.",
    source: "HR. Bukhari"
  },
  {
    arabic: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ",
    indonesian: "Sedekah dapat memadamkan dosa sebagaimana air memadamkan api.",
    source: "HR. Tirmidzi"
  },
  {
    arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    indonesian: "Sedekah tidak akan mengurangi harta.",
    source: "HR. Muslim"
  },
  {
    arabic: "إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ صَدَقَةٍ جَارِيَةٍ",
    indonesian: "Jika anak Adam meninggal, terputuslah amalnya kecuali dari tiga perkara: sedekah jariyah...",
    source: "HR. Muslim"
  },
  {
    arabic: "أَحَبُّ الْبِلَادِ إِلَى اللَّهِ مَسَاجِدُهَا",
    indonesian: "Tempat yang paling dicintai Allah adalah masjid-masjid.",
    source: "HR. Muslim"
  },
  {
    arabic: "مَنْ غَدَا إِلَى الْمَسْجِدِ أَوْ رَاحَ أَعَدَّ اللَّهُ لَهُ فِي الْجَنَّةِ نُزُلًا",
    indonesian: "Barangsiapa berangkat ke masjid pagi atau sore, Allah menyediakan untuknya jamuan di surga.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    indonesian: "Sesungguhnya setiap amal tergantung pada niatnya.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
    indonesian: "Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.",
    source: "HR. Thabrani"
  },
  {
    arabic: "الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى",
    indonesian: "Tangan di atas (yang memberi) lebih baik dari tangan di bawah (yang menerima).",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ",
    indonesian: "Senyumanmu di hadapan saudaramu adalah sedekah.",
    source: "HR. Tirmidzi"
  },
  {
    arabic: "مَنْ صَلَّى الْفَجْرَ فِي جَمَاعَةٍ فَهُوَ فِي ذِمَّةِ اللَّهِ",
    indonesian: "Barangsiapa sholat Subuh berjamaah, maka ia dalam jaminan Allah.",
    source: "HR. Muslim"
  },
  {
    arabic: "بَشِّرِ الْمَشَّائِينَ فِي الظُّلَمِ إِلَى الْمَسَاجِدِ بِالنُّورِ التَّامِّ يَوْمَ الْقِيَامَةِ",
    indonesian: "Berikanlah kabar gembira kepada orang yang berjalan dalam kegelapan menuju masjid dengan cahaya sempurna di hari kiamat.",
    source: "HR. Abu Dawud & Tirmidzi"
  },
  {
    arabic: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ",
    indonesian: "Sesungguhnya Allah mencintai jika salah seorang dari kalian mengerjakan suatu pekerjaan, ia menyempurnakannya.",
    source: "HR. Baihaqi"
  },
  {
    arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
    indonesian: "Kebersihan adalah sebagian dari iman.",
    source: "HR. Muslim"
  },
  {
    arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    indonesian: "Tidak sempurna iman seseorang hingga ia mencintai saudaranya seperti mencintai dirinya sendiri.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ",
    indonesian: "Barangsiapa menempuh jalan untuk menuntut ilmu, Allah memudahkan baginya jalan menuju surga.",
    source: "HR. Muslim"
  },
  {
    arabic: "أَفْضَلُ الصَّدَقَةِ سِقَايَةُ الْمَاءِ",
    indonesian: "Sedekah yang paling utama adalah memberi minum air.",
    source: "HR. Ahmad"
  },
  {
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    indonesian: "Muslim sejati adalah orang yang kaum muslimin lainnya selamat dari lidah dan tangannya.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "مَا مِنْ يَوْمٍ يُصْبِحُ الْعِبَادُ فِيهِ إِلَّا مَلَكَانِ يَنْزِلَانِ",
    indonesian: "Tidak ada satu hari pun yang dilalui hamba di pagi hari kecuali dua malaikat turun, yang satu berdoa: Ya Allah berikanlah ganti kepada orang yang berinfak.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    indonesian: "Sebaik-baik kalian adalah yang mempelajari Al-Quran dan mengajarkannya.",
    source: "HR. Bukhari"
  },
  {
    arabic: "الدُّنْيَا مَتَاعٌ وَخَيْرُ مَتَاعِ الدُّنْيَا الْمَرْأَةُ الصَّالِحَةُ",
    indonesian: "Dunia adalah perhiasan, dan sebaik-baik perhiasan dunia adalah wanita shalehah.",
    source: "HR. Muslim"
  },
  {
    arabic: "رَضَا اللَّهِ فِي رَضَا الْوَالِدَيْنِ",
    indonesian: "Ridha Allah tergantung pada ridha orang tua.",
    source: "HR. Tirmidzi"
  },
  {
    arabic: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ",
    indonesian: "Barangsiapa tidak menyayangi, maka tidak akan disayangi.",
    source: "HR. Bukhari & Muslim"
  },
  {
    arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ",
    indonesian: "Bertakwalah kepada Allah di mana pun kamu berada.",
    source: "HR. Tirmidzi"
  },
  {
    arabic: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ",
    indonesian: "Sesungguhnya Allah itu Maha Indah dan mencintai keindahan.",
    source: "HR. Muslim"
  },
  {
    arabic: "الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ",
    indonesian: "Orang yang menunjukkan kebaikan seperti orang yang melakukannya.",
    source: "HR. Muslim"
  },
  {
    arabic: "مَنْ فَرَّجَ عَنْ مُسْلِمٍ كُرْبَةً فَرَّجَ اللَّهُ عَنْهُ كُرْبَةً",
    indonesian: "Barangsiapa melepaskan kesusahan seorang muslim, Allah akan melepaskan kesusahannya.",
    source: "HR. Bukhari & Muslim"
  }
];

export default function HadithSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % hadiths.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + hadiths.length) % hadiths.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  // Auto-slide every 8 seconds
  useEffect(() => {
    const interval = setInterval(goToNext, 8000);
    return () => clearInterval(interval);
  }, [goToNext]);

  const currentHadith = hadiths[currentIndex];

  return (
    <div className="inline-flex flex-col items-center gap-4 bg-card/60 backdrop-blur-md px-6 py-5 rounded-2xl shadow-xl border border-gold/20 card-gold-border w-full max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-2 w-full justify-center border-b border-gold/20 pb-3">
        <BookOpen className="w-5 h-5 text-gold" />
        <span className="text-sm font-medium text-gold font-amiri">Mutiara Hadits</span>
        <Star className="w-4 h-4 text-gold animate-pulse" />
      </div>

      {/* Hadith Content */}
      <div 
        className={`min-h-[140px] flex flex-col items-center justify-center text-center px-4 transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentHadith.arabic && (
          <p className="text-xl md:text-2xl font-amiri text-gold leading-relaxed mb-3" dir="rtl">
            {currentHadith.arabic}
          </p>
        )}
        <p className="text-sm md:text-base text-foreground leading-relaxed mb-2">
          "{currentHadith.indonesian}"
        </p>
        <p className="text-xs text-secondary font-medium">
          ({currentHadith.source})
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 w-full justify-center pt-2 border-t border-gold/20">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          className="h-8 w-8 text-gold hover:text-gold/80 hover:bg-gold/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-1">
          {hadiths.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsTransitioning(false), 500);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-gold w-4' 
                  : 'bg-gold/30 hover:bg-gold/50'
              }`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="h-8 w-8 text-gold hover:text-gold/80 hover:bg-gold/10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {currentIndex + 1} / {hadiths.length}
      </p>
    </div>
  );
}
