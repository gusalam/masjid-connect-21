import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AssetsList from "@/components/AssetsList";

export default function Inventaris() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventaris Masjid</h1>
            <p className="text-muted-foreground">Detail aset dan barang inventaris</p>
          </div>
        </div>

        <AssetsList />
      </div>
    </div>
  );
}