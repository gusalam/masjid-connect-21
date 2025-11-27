import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Tentang from "./pages/Tentang";
import Kegiatan from "./pages/Kegiatan";
import Kontak from "./pages/Kontak";
import Donasi from "./pages/Donasi";
import AdminDashboard from "./pages/admin/Dashboard";
import MosqueProfileCMS from "./pages/admin/MosqueProfile";
import ActivitiesCMS from "./pages/admin/Activities";
import JamaahManagement from "./pages/admin/Jamaah";
import FinancialReports from "./pages/admin/Laporan";
import DonationsManagement from "./pages/admin/Donasi";
import GalleryManagement from "./pages/admin/Galeri";
import AdminInventaris from "./pages/admin/Inventaris";
import BendaharaDashboard from "./pages/bendahara/Dashboard";
import InputPemasukan from "./pages/bendahara/InputPemasukan";
import InputPengeluaran from "./pages/bendahara/InputPengeluaran";
import BuatLaporan from "./pages/bendahara/BuatLaporan";
import BendaharaInventaris from "./pages/bendahara/Inventaris";
import JamaahDashboard from "./pages/jamaah/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/kegiatan" element={<Kegiatan />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/donasi" element={<Donasi />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/profil-masjid" element={<MosqueProfileCMS />} />
          <Route path="/admin/kegiatan" element={<ActivitiesCMS />} />
          <Route path="/admin/jamaah" element={<JamaahManagement />} />
          <Route path="/admin/laporan" element={<FinancialReports />} />
          <Route path="/admin/donasi" element={<DonationsManagement />} />
          <Route path="/admin/galeri" element={<GalleryManagement />} />
          <Route path="/admin/inventaris" element={<AdminInventaris />} />
          <Route path="/bendahara/dashboard" element={<BendaharaDashboard />} />
          <Route path="/bendahara/input-pemasukan" element={<InputPemasukan />} />
          <Route path="/bendahara/input-pengeluaran" element={<InputPengeluaran />} />
          <Route path="/bendahara/buat-laporan" element={<BuatLaporan />} />
          <Route path="/bendahara/inventaris" element={<BendaharaInventaris />} />
          <Route path="/jamaah/dashboard" element={<JamaahDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
