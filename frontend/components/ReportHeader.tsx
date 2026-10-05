'use client';

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';

interface ReportHeaderProps {
  id: number;
  reportMonth: string;
  initialName?: string;
  initialBlock?: string;
}

export function ReportHeader({
  id,
  reportMonth,
  initialName = 'Center Sheikhe',
  initialBlock = 'Alawalpur (Jalandhar)',
}: ReportHeaderProps) {
  const [details, setDetails] = useState({ name: initialName, block: initialBlock });
  const [draft, setDraft] = useState(details);
  const [isEditing, setIsEditing] = useState(false);

  const formattedDate = new Date(reportMonth).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const toggleEdit = (save = false) => {
    if (save) setDetails(draft);
    else setDraft(details);
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b-2 border-black pb-4">
      <div className="space-y-1">
        {!isEditing ? (
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
              {details.name}, Block-{details.block}
            </h1>
            <button
              type="button"
              onClick={() => toggleEdit(false)}
              className="no-print inline-flex items-center gap-1 text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded hover:bg-sky-100"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        ) : (
          <div className="no-print flex flex-wrap items-center gap-2 pt-1">
            {(['name', 'block'] as const).map((field) => (
              <input
                key={field}
                type="text"
                value={draft[field]}
                placeholder={field === 'name' ? 'Center Name' : 'Block Name'}
                onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1 text-sm text-black focus:outline-none focus:ring-1 focus:ring-sky-600"
              />
            ))}
            <button
              type="button"
              onClick={() => toggleEdit(true)}
              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={() => toggleEdit(false)}
              className="inline-flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        )}

        <p className="text-xs sm:text-sm font-semibold text-gray-700">
          School-wise &amp; Category-wise Enrollment Register
        </p>
      </div>

      <div className="text-left sm:text-right font-bold text-xs sm:text-sm text-black">
        <p>Date: {formattedDate}</p>
      </div>
    </div>
  );
}

export function ReportFooterSignatures() {
  return (
    <div className="pt-12 grid grid-cols-2 text-center font-bold text-xs sm:text-sm">
      {['Center Head Teacher (CHT) Signature', 'Block Primary Education Officer (BPEO)'].map((title) => (
        <div key={title}>
          <p className="border-t border-black inline-block px-8 pt-1">{title}</p>
        </div>
      ))}
    </div>
  );
}