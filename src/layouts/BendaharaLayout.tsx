import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  LogOut,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/bendahara/dashboard" },
  { icon: TrendingUp, label: "Input Pemasukan", path: "/bendahara/input-pemasukan" },
  { icon: TrendingDown, label: "Input Pengeluaran", path: "/bendahara/input-pengeluaran" },
  { icon: Package, label: "Inventaris", path: "/bendahara/inventaris" },
  { icon: FileText, label: "Buat Laporan", path: "/bendahara/buat-laporan" },
];

export default function BendaharaLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logout Berhasil",
      description: "Sampai jumpa kembali!",
    });
    navigate("/login", { replace: true });
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-accent" />
              <span className="font-bold font-amiri text-lg">Bendahara</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/30"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center border border-accent/30">
                <Wallet className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.full_name || "Bendahara"}
                </p>
                <p className="text-xs text-muted-foreground">Bendahara</p>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            className={cn(
              "border-destructive/30 text-destructive hover:bg-destructive/10",
              collapsed ? "w-full px-0" : "w-full"
            )}
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <Outlet />
      </main>

      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar dari sistem?"
        confirmText="Logout"
        cancelText="Batal"
        onConfirm={handleLogout}
        variant="destructive"
      />
    </div>
  );
}
