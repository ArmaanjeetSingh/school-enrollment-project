import React from 'react';
import { Pencil, Trash2, Loader2, Plus, Calculator } from 'lucide-react';
import { EnrollmentDataResponse } from '@/types/enrollments';

interface ClassTotals {
  boys: number;
  girls: number;
  total: number;
  below_6: number;
  between_6_and_11: number;
  above_11: number;
}

interface EnrollmentTableProps {
  loading: boolean;
  activeClass: number;
  classEnrollments: EnrollmentDataResponse[];
  classTotals: ClassTotals;
  onEdit: (item: EnrollmentDataResponse) => void;
  onDelete: (id: number) => void;
  onOpenModal: () => void;
}

export const EnrollmentTable: React.FC<EnrollmentTableProps> = ({
  loading,
  activeClass,
  classEnrollments,
  classTotals,
  onEdit,
  onDelete,
  onOpenModal,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-b-lg border border-gray-200 bg-white p-16 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading enrollment data...</span>
      </div>
    );
  }

  if (classEnrollments.length === 0) {
    return (
      <div className="space-y-3 rounded-b-lg border border-gray-200 bg-white py-16 text-center">
        <p className="text-sm text-gray-500">
          No category records found for Class {activeClass}.
        </p>
        <button
          type="button"
          onClick={onOpenModal}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          <Plus className="h-4 w-4" />
          <span>Add category data for Class {activeClass}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-b-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5 text-center">Boys</th>
              <th className="px-4 py-3.5 text-center">Girls</th>
              <th className="bg-blue-50/60 px-4 py-3.5 text-center font-bold text-blue-900">Total</th>
              <th className="px-4 py-3.5 text-center">&lt; 6 yrs</th>
              <th className="px-4 py-3.5 text-center">6–11 yrs</th>
              <th className="px-4 py-3.5 text-center">11+ yrs</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classEnrollments.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-gray-50/80">
                <td className="px-4 py-3.5 font-semibold text-blue-600">
                  {item.category}
                </td>
                <td className="px-4 py-3.5 text-center text-gray-800">{item.boys}</td>
                <td className="px-4 py-3.5 text-center text-gray-800">{item.girls}</td>
                <td className="bg-blue-50/30 px-4 py-3.5 text-center font-bold text-gray-900">
                  {item.boys + item.girls}
                </td>
                <td className="px-4 py-3.5 text-center text-gray-600">{item.below_6}</td>
                <td className="px-4 py-3.5 text-center text-gray-600">{item.between_6_and_11}</td>
                <td className="px-4 py-3.5 text-center text-gray-600">{item.above_11}</td>
                <td className="px-4 py-3.5 text-right space-x-1">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-100 font-bold text-gray-900">
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-gray-600" />
                  <span>Total for Class {activeClass}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-center">{classTotals.boys}</td>
              <td className="px-4 py-3.5 text-center">{classTotals.girls}</td>
              <td className="bg-blue-100/60 px-4 py-3.5 text-center text-blue-900">
                {classTotals.total}
              </td>
              <td className="px-4 py-3.5 text-center">{classTotals.below_6}</td>
              <td className="px-4 py-3.5 text-center">{classTotals.between_6_and_11}</td>
              <td className="px-4 py-3.5 text-center">{classTotals.above_11}</td>
              <td className="px-4 py-3.5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};