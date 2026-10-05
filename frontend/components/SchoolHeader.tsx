import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { SchoolResponse } from '@/types/schools';

interface SchoolHeaderProps {
  school: SchoolResponse | null;
  onOpenModal: () => void;
}

export const SchoolHeader: React.FC<SchoolHeaderProps> = ({ school, onOpenModal }) => {
  return (
    <div className="space-y-4">
      <Link
        href="/schools"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Schools</span>
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-lg bg-white p-6 shadow-sm border border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            {school?.name || 'Loading school...'}
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Enrollment Data Management
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Enrollment Record</span>
        </button>
      </div>
    </div>
  );
};