import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, FileSpreadsheet, File } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ReportContent {
  summary: {
    total_income: number;
    total_donations: number;
    total_expense: number;
    balance: number;
    transaction_count: number;
    donation_count: number;
  };
  breakdown: {
    income_by_category: Record<string, number>;
    expense_by_category: Record<string, number>;
    donation_by_category: Record<string, number>;
  };
  transactions: any[];
  donations: any[];
}

interface Report {
  id: string;
  title: string;
  type: string;
  period_start: string;
  period_end: string;
  content: ReportContent | null;
  created_at: string;
}

export default function LaporanBendahara() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);

  const { data: reportsData, refetch } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (reportsData) {
      setReports(reportsData as unknown as Report[]);
    }
  }, [reportsData]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('reports-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const downloadCSV = (report: Report) => {
    const content = report.content;
    let csv = "Laporan Keuangan\n";
    csv += `Judul,${report.title}\n`;
    csv += `Periode,${report.period_start} - ${report.period_end}\n\n`;
    
    csv += "RINGKASAN\n";
    csv += `Total Pemasukan,${content.summary.total_income}\n`;
    csv += `Total Donasi,${content.summary.total_donations}\n`;
    csv += `Total Pengeluaran,${content.summary.total_expense}\n`;
    csv += `Saldo,${content.summary.balance}\n\n`;

    if (content.transactions && content.transactions.length > 0) {
      csv += "TRANSAKSI\n";
      csv += "Tanggal,Kategori,Tipe,Jumlah,Deskripsi\n";
      content.transactions.forEach((t: any) => {
        csv += `${t.transaction_date},${t.category},${t.type},${t.amount},${t.description || ''}\n`;
      });
      csv += "\n";
    }

    if (content.donations && content.donations.length > 0) {
      csv += "DONASI\n";
      csv += "Tanggal,Donatur,Kategori,Jumlah\n";
      content.donations.forEach((d: any) => {
        csv += `${d.created_at?.split('T')[0]},${d.donor_name || 'Anonim'},${d.category},${d.amount}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${report.title.replace(/\s/g, '_')}.csv`;
    link.click();
    
    toast({ title: "Berhasil", description: "Laporan CSV berhasil diunduh" });
  };

  const downloadExcel = (report: Report) => {
    // For Excel, we'll create a more structured CSV that Excel can open
    const content = report.content;
    let csv = "\uFEFF"; // BOM for Excel UTF-8
    csv += "Laporan Keuangan Masjid\n";
    csv += `Judul;${report.title}\n`;
    csv += `Periode;${report.period_start} sampai ${report.period_end}\n\n`;
    
    csv += "=== RINGKASAN ===\n";
    csv += `Total Pemasukan (Transaksi);${content.summary.total_income}\n`;
    csv += `Total Donasi;${content.summary.total_donations}\n`;
    csv += `Total Pengeluaran;${content.summary.total_expense}\n`;
    csv += `Saldo Akhir;${content.summary.balance}\n`;
    csv += `Jumlah Transaksi;${content.summary.transaction_count}\n`;
    csv += `Jumlah Donasi;${content.summary.donation_count}\n\n`;

    if (content.transactions && content.transactions.length > 0) {
      csv += "=== DETAIL TRANSAKSI ===\n";
      csv += "Tanggal;Kategori;Tipe;Jumlah;Deskripsi\n";
      content.transactions.forEach((t: any) => {
        csv += `${t.transaction_date};${t.category};${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'};${t.amount};${t.description || '-'}\n`;
      });
      csv += "\n";
    }

    if (content.donations && content.donations.length > 0) {
      csv += "=== DETAIL DONASI ===\n";
      csv += "Tanggal;Donatur;Kategori;Jumlah\n";
      content.donations.forEach((d: any) => {
        csv += `${d.created_at?.split('T')[0]};${d.donor_name || 'Anonim'};${d.category};${d.amount}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${report.title.replace(/\s/g, '_')}.xls`;
    link.click();
    
    toast({ title: "Berhasil", description: "Laporan Excel berhasil diunduh" });
  };

  const downloadPDF = (report: Report) => {
    const content = report.content;
    
    // Create printable HTML for PDF
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${report.title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
          .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .income { color: green; }
          .expense { color: red; }
          .total { font-weight: bold; font-size: 1.1em; }
        </style>
      </head>
      <body>
        <h1>${report.title}</h1>
        <p>Periode: ${report.period_start} - ${report.period_end}</p>
        
        <h2>Ringkasan</h2>
        <div class="summary-item"><span>Total Pemasukan (Transaksi):</span><span class="income">${formatCurrency(content.summary.total_income)}</span></div>
        <div class="summary-item"><span>Total Donasi:</span><span class="income">${formatCurrency(content.summary.total_donations)}</span></div>
        <div class="summary-item"><span>Total Pengeluaran:</span><span class="expense">${formatCurrency(content.summary.total_expense)}</span></div>
        <div class="summary-item total"><span>Saldo Akhir:</span><span>${formatCurrency(content.summary.balance)}</span></div>
        
        ${content.transactions && content.transactions.length > 0 ? `
          <h2>Detail Transaksi</h2>
          <table>
            <tr><th>Tanggal</th><th>Kategori</th><th>Tipe</th><th>Jumlah</th><th>Deskripsi</th></tr>
            ${content.transactions.map((t: any) => `
              <tr>
                <td>${t.transaction_date}</td>
                <td>${t.category}</td>
                <td>${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</td>
                <td class="${t.type === 'income' ? 'income' : 'expense'}">${formatCurrency(t.amount)}</td>
                <td>${t.description || '-'}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
        
        ${content.donations && content.donations.length > 0 ? `
          <h2>Detail Donasi</h2>
          <table>
            <tr><th>Tanggal</th><th>Donatur</th><th>Kategori</th><th>Jumlah</th></tr>
            ${content.donations.map((d: any) => `
              <tr>
                <td>${d.created_at?.split('T')[0]}</td>
                <td>${d.donor_name || 'Anonim'}</td>
                <td>${d.category}</td>
                <td class="income">${formatCurrency(d.amount)}</td>
              </tr>
            `).join('')}
          </table>
        ` : ''}
        
        <p style="margin-top: 40px; font-size: 0.9em; color: #666;">
          Dibuat pada: ${format(new Date(report.created_at), "d MMMM yyyy HH:mm", { locale: id })}
        </p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    
    toast({ title: "Info", description: "Gunakan Print to PDF pada dialog print" });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Card className="card-gold-border">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
              Kelola Laporan Bendahara
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
                Belum ada laporan dari bendahara
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[700px] sm:min-w-0 px-4 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Judul</TableHead>
                        <TableHead className="text-xs sm:text-sm">Periode</TableHead>
                        <TableHead className="text-xs sm:text-sm">Pemasukan</TableHead>
                        <TableHead className="text-xs sm:text-sm">Pengeluaran</TableHead>
                        <TableHead className="text-xs sm:text-sm">Saldo</TableHead>
                        <TableHead className="text-xs sm:text-sm">Tanggal</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Unduh</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium text-xs sm:text-sm">{report.title}</TableCell>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                            {report.period_start} - {report.period_end}
                          </TableCell>
                          <TableCell className="text-green-600 text-xs sm:text-sm whitespace-nowrap">
                            {formatCurrency((report.content?.summary?.total_income || 0) + (report.content?.summary?.total_donations || 0))}
                          </TableCell>
                          <TableCell className="text-destructive text-xs sm:text-sm whitespace-nowrap">
                            {formatCurrency(report.content?.summary?.total_expense || 0)}
                          </TableCell>
                          <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                            {formatCurrency(report.content?.summary?.balance || 0)}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                            {format(new Date(report.created_at), "d MMM yyyy", { locale: id })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                onClick={() => downloadExcel(report)}
                                title="Download Excel"
                              >
                                <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                onClick={() => downloadPDF(report)}
                                title="Download PDF"
                              >
                                <File className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                onClick={() => downloadCSV(report)}
                                title="Download CSV"
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
