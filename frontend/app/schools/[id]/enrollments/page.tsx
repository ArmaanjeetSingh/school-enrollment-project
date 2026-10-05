'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { enrollmentService } from '@/services/enrollments';
import { schoolService } from '@/services/schools';
import { EnrollmentDataResponse } from '@/types/enrollments';
import { SchoolResponse } from '@/types/schools';

import { SchoolHeader } from '@/components/SchoolHeader';
import { ClassTabs } from '@/components/ClassTabs';
import { EnrollmentTable } from '@/components/EnrollmentTable';
import { EnrollmentModal } from '@/components/EnrollmentModal';

export default function SchoolEnrollmentPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();

  const rawId = params?.schoolId || params?.id;
  const schoolId = Number(rawId);

  const [school, setSchool] = useState<SchoolResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentDataResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [activeClass, setActiveClass] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<EnrollmentDataResponse | null>(null);

  // Auth Guard
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  // Fetch Data
  useEffect(() => {
    if (!user || !schoolId || isNaN(schoolId)) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [enrollmentList, schoolData] = await Promise.allSettled([
          enrollmentService.getSchoolEnrollments(schoolId),
          schoolService.getSchool(schoolId),
        ]);

        if (enrollmentList.status === 'fulfilled') {
          setEnrollments(enrollmentList.value);
        } else {
          toast.error('Data Loading is facing error');
        }

        if (schoolData.status === 'fulfilled') {
          setSchool(schoolData.value);
        } else {
          setSchool({ id: schoolId, name: `School ID: ${schoolId}` } as SchoolResponse);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, user]);

  const classEnrollments = useMemo(() => {
    return enrollments.filter((item) => item.class_ === activeClass);
  }, [enrollments, activeClass]);

  const classTotals = useMemo(() => {
    return classEnrollments.reduce(
      (acc, item) => ({
        boys: acc.boys + item.boys,
        girls: acc.girls + item.girls,
        total: acc.total + item.boys + item.girls,
        below_6: acc.below_6 + item.below_6,
        between_6_and_11: acc.between_6_and_11 + item.between_6_and_11,
        above_11: acc.above_11 + item.above_11,
      }),
      { boys: 0, girls: 0, total: 0, below_6: 0, between_6_and_11: 0, above_11: 0 }
    );
  }, [classEnrollments]);

  const handleOpenModal = (item?: EnrollmentDataResponse) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (enrollmentId: number) => {
    if (!confirm('Do you want to remove record')) return;

    const toastId = toast.loading('Record is being removed...');
    try {
      await enrollmentService.deleteEnrollment(enrollmentId);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      toast.success('Record deleted successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to delete record', { id: toastId });
    }
  };

  const handleSaveSuccess = (savedItem: EnrollmentDataResponse, isEdit: boolean) => {
    setEnrollments((prev) =>
      isEdit
        ? prev.map((e) => (e.id === savedItem.id ? savedItem : e))
        : [...prev, savedItem]
    );
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="flex items-center gap-2 text-xl font-semibold text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading secure data...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-6 font-sans">
        <SchoolHeader
          school={school}
          onOpenModal={() => handleOpenModal()}
        />

        <div className="space-y-0">
          <ClassTabs
            activeClass={activeClass}
            setActiveClass={setActiveClass}
            enrollments={enrollments}
          />

          <EnrollmentTable
            loading={loading}
            activeClass={activeClass}
            classEnrollments={classEnrollments}
            classTotals={classTotals}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
            onOpenModal={() => handleOpenModal()}
          />
        </div>

        <EnrollmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          editingItem={editingItem}
          activeClass={activeClass}
          schoolId={schoolId}
          onSaveSuccess={handleSaveSuccess}
        />
      </div>
    </div>
  );
}