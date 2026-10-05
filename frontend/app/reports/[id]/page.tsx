'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { reportService } from '@/services/reports';
import { ReportDetailResponse } from '@/types/reports';
import { CATEGORIES } from '@/lib/reports';
import { ReportActionBar } from '@/components/ReportAction';
import { ReportHeader, ReportFooterSignatures } from '@/components/ReportHeader';
import { CategorySchoolTable } from '@/components/CategorySchoolTable';

export default function PrintableReportPage() {
  const params = useParams();
  const reportId = Number(params?.id);

  const [report, setReport] = useState<ReportDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!reportId || isNaN(reportId)) return;
    setLoading(true);
    try {
      const data = await reportService.getReport(reportId);
      setReport(data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleRefresh = async () => {
    if (!reportId) return;
    setRefreshing(true);
    const toastId = toast.loading('Refreshing report data...');
    try {
      const updated = await reportService.refreshReport(reportId);
      setReport(updated);
      toast.success('Report updated successfully', { id: toastId });
    } catch {
      toast.error('Failed to refresh report', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  };

  const handleFinalize = async () => {
    if (!reportId || !window.confirm('Are you sure you want to finalize this report?')) return;
    const toastId = toast.loading('Finalizing report...');
    try {
      await reportService.finalizeReport(reportId);
      setReport((prev) => (prev ? { ...prev, status: 'FINALIZED' } : null));
      toast.success('Report finalized successfully', { id: toastId });
    } catch {
      toast.error('Failed to finalize report', { id: toastId });
    }
  };

  const schoolIds = useMemo(() => {
    if (!report?.data) return [];
    return Array.from(new Set(report.data.map((item) => item.school_id))).sort((a, b) => a - b);
  }, [report]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-sm font-medium text-red-600">
        Report not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans print:bg-white print:p-0">
      <Toaster position="top-right" />

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            font-size: 10pt;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        <ReportActionBar
          status={report.status}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onFinalize={handleFinalize}
          onPrint={() => window.print()}
        />

        <div className="print-area bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8 text-black">
          <ReportHeader id={report.id} reportMonth={report.report_month} />

          {CATEGORIES.map((category) => (
            <CategorySchoolTable
              key={category}
              category={category}
              schoolIds={schoolIds}
              reportData={report.data}
            />
          ))}

          <ReportFooterSignatures />
        </div>
      </div>
    </div>
  );
}