'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, UserPlus, Loader2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { schoolService } from '@/services/schools';
import { SchoolResponse } from '@/types/schools';

import { SchoolsTable } from '@/components/SchoolsTable';
import { SchoolFormModal } from '@/components/SchoolFormModal';
import { JoinSchoolModal } from '@/components/JoinSchoolModal';
import { ViewSchoolModal } from '@/components/ViewSchoolModal';

export default function SchoolsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [schools, setSchools] = useState<SchoolResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal triggers
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolResponse | null>(null);
  const [viewingSchool, setViewingSchool] = useState<SchoolResponse | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Data fetching
  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await schoolService.getMySchools();
      setSchools(data);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSchools();
    }
  }, [user]);

  // Form submission (Create / Update)
  const handleSaveSchool = async (name: string) => {
    const toastId = toast.loading('Saving school...');
    try {
      if (editingSchool) {
        const updated = await schoolService.updateSchool(editingSchool.id, { name });
        setSchools((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.success('School updated successfully', { id: toastId });
      } else {
        const created = await schoolService.createSchool({ name });
        setSchools((prev) => [...prev, created]);
        toast.success('School created successfully', { id: toastId });
      }
    } catch {
      toast.error('Failed to save school', { id: toastId });
      throw new Error('Save failed');
    }
  };

  // Join school by passcode
  const handleJoinSchool = async (passcode: string) => {
    await schoolService.joinSchool({ passcode });
    toast.success('Successfully joined school');
    fetchSchools();
  };

  // Delete school
  const handleDeleteSchool = async (schoolId: number) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;

    const toastId = toast.loading('Deleting school...');
    try {
      await schoolService.deleteSchool(schoolId);
      setSchools((prev) => prev.filter((s) => s.id !== schoolId));
      toast.success('School deleted successfully', { id: toastId });
    } catch {
      toast.error('Failed to delete school', { id: toastId });
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-base font-medium text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Schools</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your registered schools and operator assignments
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <UserPlus className="h-4 w-4 text-gray-500" />
              <span>Join as Operator</span>
            </button>
            <button
              onClick={() => {
                setEditingSchool(null);
                setIsFormModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add School</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <SchoolsTable
            schools={schools}
            loading={loading}
            onView={(school) => setViewingSchool(school)}
            onEdit={(school) => {
              setEditingSchool(school);
              setIsFormModalOpen(true);
            }}
            onDelete={handleDeleteSchool}
          />
        </div>

        {/* Modals */}
        <SchoolFormModal
          isOpen={isFormModalOpen}
          editingSchool={editingSchool}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleSaveSchool}
        />

        <JoinSchoolModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={handleJoinSchool}
        />

        <ViewSchoolModal
          school={viewingSchool}
          onClose={() => setViewingSchool(null)}
        />
      </div>
    </div>
  );
}