'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import { SchoolResponse } from '@/types/schools';

interface SchoolsTableProps {
    schools: SchoolResponse[];
    loading: boolean;
    onView: (school: SchoolResponse) => void;
    onEdit: (school: SchoolResponse) => void;
    onDelete: (schoolId: number) => void;
}

export function SchoolsTable({
    schools,
    loading,
    onEdit,
    onDelete,
}: SchoolsTableProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium">Loading schools...</span>
            </div>
        );
    }

    if (schools.length === 0) {
        return (
            <div className="py-16 text-center text-sm text-gray-500">
                No schools found. Click "Add School" above or enter a passcode to join one.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                        <th className="py-3.5 px-6">School Name</th>
                        <th className="text-xs uppercase tracking-wider text-gray-500">Passcode</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {schools.map((school) => (
                        <tr key={school.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="py-4 px-6 font-medium text-gray-900">{school.name}</td>
                            <td>
                                <p className="font-mono text-sm font-semibold text-gray-800">
                                    {(school as any).operator_passcode || 'N/A'}
                                </p>
                            </td>
                            <td className="py-4 px-6 text-right space-x-1">
                                <Link
                                    href={`/schools/${school.id}/enrollments`}
                                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                    title="Manage enrollments"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Enrollments</span>
                                </Link>

                                <button
                                    onClick={() => onEdit(school)}
                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                    title="Edit name"
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span>Edit</span>
                                </button>

                                <button
                                    onClick={() => onDelete(school.id)}
                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                                    title="Delete school"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}