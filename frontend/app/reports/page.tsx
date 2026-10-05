'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { FileSpreadsheet, Plus, RefreshCw, Eye, CheckCircle2, Calendar, Loader2, Clock } from 'lucide-react';
import { reportService } from '@/services/reports';
import { ReportResponse } from '@/types/reports';
import { AIReportQueryWidget } from '@/components/AIQueryReport';

export default function ReportsListPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      setReports(await reportService.getMyReports());
    } catch {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return toast.error('Please select a date');

    setGenerating(true);
    const toastId = toast.loading('Generating report...');
    try {
      const newReport = await reportService.generateReport(selectedDate);
      toast.success('Report generated successfully', { id: toastId });
      router.push(`/reports/${newReport.id}`);
    } catch {
      toast.error('Failed to generate report', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl border border-gray-200 gap-4 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              <span>Enrollment Reports</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and view monthly school enrollment summaries</p>
          </div>
          <button
            type="button"
            onClick={fetchReports}
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-lg font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        <AIReportQueryWidget/>

        {/* Generate Widget */}
        <form onSubmit={handleGenerateReport} className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-blue-950 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Generate New Report</span>
            </h3>
            <p className="text-xs text-blue-800 mt-0.5">Compile enrollment data for the selected month</p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={generating}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span>Generate</span>
            </button>
          </div>
        </form>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 flex justify-center items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-500">
              No reports found. Generate one using the form above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    <th className="py-3 px-5">Report Month</th>
                    <th className="py-3 px-5">Generated At</th>
                    <th className="py-3 px-5 text-center">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-blue-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span>{item.report_month}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-gray-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>{new Date(item.generated_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                            item.status === 'END'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.status === 'END' ? 'Finalized' : 'Draft'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/reports/${item.id}`}
                          className="inline-flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium px-2.5 py-1 rounded-md text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}