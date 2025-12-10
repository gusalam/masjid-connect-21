import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Tentang from "./pages/Tentang";
import Kegiatan from "./pages/Kegiatan";
import Kontak from "./pages/Kontak";
import Donasi from "./pages/Donasi";
import RiwayatTransaksi from "./pages/RiwayatTransaksi";
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
import BendaharaDashboard from "./pages/bendahara/Dashboard";
import InputPemasukan from "./pages/bendahara/InputPemasukan";
import InputPengeluaran from "./pages/bendahara/InputPengeluaran";
import BuatLaporan from "./pages/bendahara/BuatLaporan";
import BendaharaInventaris from "./pages/bendahara/Inventaris";
import JamaahDashboard from "./pages/jamaah/Dashboard";
import JamaahProfil from "./pages/jamaah/Profil";
import JamaahDonasi from "./pages/jamaah/Donasi";
import JamaahRiwayatDonasi from "./pages/jamaah/RiwayatDonasi";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/kegiatan" element={<Kegiatan />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/donasi" element={<Donasi />} />
          <Route path="/riwayat-transaksi" element={<RiwayatTransaksi />} />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/profil-masjid" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <MosqueProfileCMS />
            </ProtectedRoute>
          } />
          <Route path="/admin/kegiatan" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <ActivitiesCMS />
            </ProtectedRoute>
          } />
          <Route path="/admin/jamaah" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <JamaahManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/laporan" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <FinancialReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/donasi" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <DonationsManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/donasi-cms" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <DonasiCMS />
            </ProtectedRoute>
          } />
          <Route path="/admin/galeri" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <GalleryManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/inventaris" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <AdminInventaris />
            </ProtectedRoute>
          } />
          <Route path="/admin/pengumuman" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <PengumumanManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/laporan-bendahara" element={
            <ProtectedRoute allowedRoles={['admin']} requireApproval={false}>
              <LaporanBendahara />
            </ProtectedRoute>
          } />
          
          {/* Bendahara Routes - Protected */}
          <Route path="/bendahara/dashboard" element={
            <ProtectedRoute allowedRoles={['bendahara']} requireApproval={false}>
              <BendaharaDashboard />
            </ProtectedRoute>
          } />
          <Route path="/bendahara/input-pemasukan" element={
            <ProtectedRoute allowedRoles={['bendahara']} requireApproval={false}>
              <InputPemasukan />
            </ProtectedRoute>
          } />
          <Route path="/bendahara/input-pengeluaran" element={
            <ProtectedRoute allowedRoles={['bendahara']} requireApproval={false}>
              <InputPengeluaran />
            </ProtectedRoute>
          } />
          <Route path="/bendahara/buat-laporan" element={
            <ProtectedRoute allowedRoles={['bendahara']} requireApproval={false}>
              <BuatLaporan />
            </ProtectedRoute>
          } />
          <Route path="/bendahara/inventaris" element={
            <ProtectedRoute allowedRoles={['bendahara']} requireApproval={false}>
              <BendaharaInventaris />
            </ProtectedRoute>
          } />
          
          {/* Jamaah Routes - Protected with approval check */}
          <Route path="/jamaah/dashboard" element={
            <ProtectedRoute allowedRoles={['jamaah']} requireApproval={true}>
              <JamaahDashboard />
            </ProtectedRoute>
          } />
          <Route path="/jamaah/profil" element={
            <ProtectedRoute allowedRoles={['jamaah']} requireApproval={true}>
              <JamaahProfil />
            </ProtectedRoute>
          } />
          <Route path="/jamaah/donasi" element={
            <ProtectedRoute allowedRoles={['jamaah']} requireApproval={true}>
              <JamaahDonasi />
            </ProtectedRoute>
          } />
          <Route path="/jamaah/riwayat-donasi" element={
            <ProtectedRoute allowedRoles={['jamaah']} requireApproval={true}>
              <JamaahRiwayatDonasi />
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
