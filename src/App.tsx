import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layouts
import AdminLayout from "@/layouts/AdminLayout";
import BendaharaLayout from "@/layouts/BendaharaLayout";
import JamaahLayout from "@/layouts/JamaahLayout";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Tentang from "./pages/Tentang";
import Kegiatan from "./pages/Kegiatan";
import Kontak from "./pages/Kontak";
import Donasi from "./pages/Donasi";
import RiwayatTransaksi from "./pages/RiwayatTransaksi";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import MosqueProfileCMS from "./pages/admin/MosqueProfile";
import ActivitiesCMS from "./pages/admin/Activities";
import JamaahManagement from "./pages/admin/Jamaah";
import FinancialReports from "./pages/admin/Laporan";
import DonationsManagement from "./pages/admin/Donasi";
import DonasiCMS from "./pages/admin/DonasiCMS";
import GalleryManagement from "./pages/admin/Galeri";
import AdminInventaris from "./pages/admin/Inventaris";
import PengumumanManagement from "./pages/admin/Pengumuman";
import LaporanBendahara from "./pages/admin/LaporanBendahara";

// Bendahara Pages
import BendaharaDashboard from "./pages/bendahara/Dashboard";
import InputPemasukan from "./pages/bendahara/InputPemasukan";
import InputPengeluaran from "./pages/bendahara/InputPengeluaran";
import BuatLaporan from "./pages/bendahara/BuatLaporan";
import BendaharaInventaris from "./pages/bendahara/Inventaris";

// Jamaah Pages
import JamaahDashboard from "./pages/jamaah/Dashboard";
import JamaahProfil from "./pages/jamaah/Profil";
import JamaahDonasi from "./pages/jamaah/Donasi";
import JamaahRiwayatDonasi from "./pages/jamaah/RiwayatDonasi";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/login" replace />} />
            <Route path="/tentang" element={<Tentang />} />
            <Route path="/kegiatan" element={<Kegiatan />} />
            <Route path="/kontak" element={<Kontak />} />
            <Route path="/donasi" element={<Donasi />} />
            <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
            
            {/* Admin Routes - Nested with persistent layout */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profil-masjid" element={<MosqueProfileCMS />} />
              <Route path="kegiatan" element={<ActivitiesCMS />} />
              <Route path="jamaah" element={<JamaahManagement />} />
              <Route path="laporan" element={<FinancialReports />} />
              <Route path="donasi" element={<DonationsManagement />} />
              <Route path="donasi-cms" element={<DonasiCMS />} />
              <Route path="galeri" element={<GalleryManagement />} />
              <Route path="inventaris" element={<AdminInventaris />} />
              <Route path="pengumuman" element={<PengumumanManagement />} />
              <Route path="laporan-bendahara" element={<LaporanBendahara />} />
            </Route>
            
            {/* Bendahara Routes - Nested with persistent layout */}
            <Route path="/bendahara" element={
              <ProtectedRoute allowedRoles={['bendahara']} requireApproval={false}>
                <BendaharaLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/bendahara/dashboard" replace />} />
              <Route path="dashboard" element={<BendaharaDashboard />} />
              <Route path="input-pemasukan" element={<InputPemasukan />} />
              <Route path="input-pengeluaran" element={<InputPengeluaran />} />
              <Route path="buat-laporan" element={<BuatLaporan />} />
              <Route path="inventaris" element={<BendaharaInventaris />} />
            </Route>
            
            {/* Jamaah Routes - Nested with persistent layout */}
            <Route path="/jamaah" element={
              <ProtectedRoute allowedRoles={['jamaah']} requireApproval={true}>
                <JamaahLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/jamaah/dashboard" replace />} />
              <Route path="dashboard" element={<JamaahDashboard />} />
              <Route path="profil" element={<JamaahProfil />} />
              <Route path="donasi" element={<JamaahDonasi />} />
              <Route path="riwayat-donasi" element={<JamaahRiwayatDonasi />} />
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
