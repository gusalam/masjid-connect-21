import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Star, Image as ImageIcon } from "lucide-react";

export default function GalleryCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: "start",
      skipSnaps: false,
      dragFree: true
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["gallery-carousel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ImageIcon className="w-5 h-5 animate-pulse" />
          <span>Memuat galeri...</span>
        </div>
      </div>
    );
  }

  if (!galleryItems || galleryItems.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground bg-card/60 px-6 py-4 rounded-xl border border-gold/20">
          <ImageIcon className="w-5 h-5" />
          <span>Belum ada foto di galeri</span>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-card/40 relative overflow-hidden">
      <div className="absolute inset-0 islamic-pattern opacity-10" />
      
      {/* Header */}
      <div className="container mx-auto px-4 mb-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-2">
            <Star className="w-5 h-5 text-gold animate-pulse" />
            <Star className="w-5 h-5 text-gold animate-pulse" style={{ animationDelay: "0.3s" }} />
            <Star className="w-5 h-5 text-gold animate-pulse" style={{ animationDelay: "0.6s" }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-amiri">
            Galeri <span className="text-gradient-gold">Masjid</span>
          </h2>
          <p className="text-muted-foreground">Momen-momen berharga di masjid kami</p>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative z-10 overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 pl-4">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className="flex-none w-72 md:w-80 lg:w-96 group"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-lg card-gold-border bg-card/60 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-xl">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-white font-semibold text-lg truncate">{item.title}</h3>
                  {item.description && (
                    <p className="text-white/80 text-sm line-clamp-2 mt-1">{item.description}</p>
                  )}
                  {item.category && (
                    <span className="inline-block mt-2 px-3 py-1 bg-gold/20 text-gold text-xs rounded-full border border-gold/30">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="container mx-auto px-4 mt-6 relative z-10">
        <div className="flex justify-center gap-2">
          {galleryItems.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gold/30 animate-pulse"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
