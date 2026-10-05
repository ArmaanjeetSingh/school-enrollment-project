'use client';

import React from 'react';
import { X } from 'lucide-react';
import { SchoolResponse } from '@/types/schools';

interface ViewSchoolModalProps {
  school: SchoolResponse | null;
  onClose: () => void;
}

export function ViewSchoolModal({ school, onClose }: ViewSchoolModalProps) {
  if (!school) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-gray-900">School Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500">ID</span>
            <p className="text-base font-semibold text-gray-900">{school.id}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-500">
              School Name
            </span>
            <p className="text-base font-semibold text-gray-900">{school.name}</p>
          </div>
        </div>

        <div className="flex justify-end border-t pt-3">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}