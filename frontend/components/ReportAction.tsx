import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, RefreshCw, Lock } from 'lucide-react';

interface ReportActionBarProps {
  status?: string;
  refreshing: boolean;
  onRefresh: () => void;
  onFinalize: () => void;
  onPrint: () => void;
}

export function ReportActionBar({
  status,
  refreshing,
  onRefresh,
  onFinalize,
  onPrint,
}: ReportActionBarProps) {
  const isFinalized = status === 'END';

  return (
    <div className="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <Link
        href="/reports"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Reports</span>
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          onClick={onFinalize}
          disabled={isFinalized}
          className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Lock className="w-4 h-4" />
          <span>{isFinalized ? 'Finalized' : 'Finalize Report'}</span>
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report</span>
        </button>
      </div>
    </div>
  );
}