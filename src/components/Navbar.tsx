import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X, Moon, Star, Sparkles } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-gold/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center group-hover:scale-110 transition-transform glow-gold">
                <Building2 className="w-6 h-6 text-gold" />
              </div>
              <Star className="absolute -top-1 -right-1 w-3 h-3 text-gold animate-pulse" />
            </div>
            <div className="hidden md:block">
              <div className="text-xl font-bold text-foreground font-amiri">Masjid Al-Ikhlas</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Moon className="w-3 h-3" />
                Sistem Pengelolaan Modern
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-gold transition-colors">Beranda</Link>
            <Link to="/tentang" className="text-sm font-medium text-foreground hover:text-gold transition-colors">Tentang</Link>
            <Link to="/kegiatan" className="text-sm font-medium text-foreground hover:text-gold transition-colors">Kegiatan</Link>
            <Link to="/donasi" className="text-sm font-medium text-foreground hover:text-gold transition-colors">Donasi</Link>
            <Link to="/kontak" className="text-sm font-medium text-foreground hover:text-gold transition-colors">Kontak</Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            <Link to="/login">
              <Button className="bg-gold text-primary hover:bg-gold-light glow-gold">
                <Moon className="w-4 h-4 mr-2" />
                Masuk
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gold/20 bg-card/95 backdrop-blur-md">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">Beranda</Link>
            <Link to="/tentang" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">Tentang</Link>
            <Link to="/kegiatan" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">Kegiatan</Link>
            <Link to="/donasi" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">Donasi</Link>
            <Link to="/kontak" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-medium text-foreground hover:text-gold transition-colors">Kontak</Link>
            <Link to="/login" onClick={() => setIsOpen(false)} className="block px-4">
              <Button className="w-full bg-gold text-primary hover:bg-gold-light">
                <Moon className="w-4 h-4 mr-2" />
                Masuk
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
