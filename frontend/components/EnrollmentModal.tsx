import React from 'react';
import { Formik, Form, Field } from 'formik';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CATEGORIES, CLASSES, EnrollmentSchema } from '@/lib/constants';
import { enrollmentService } from '@/services/enrollments';
import { EnrollmentDataResponse, EnrollmentDataCreate } from '@/types/enrollments';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: EnrollmentDataResponse | null;
  activeClass: number;
  schoolId: number;
  onSaveSuccess: (data: EnrollmentDataResponse, isEdit: boolean) => void;
}

const NumberInput = ({ name, label }: { name: string; label: string }) => (
  <div>
    <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
    <Field
      name={name}
      type="number"
      min="0"
      className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>
);

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  activeClass,
  schoolId,
  onSaveSuccess,
}) => {
  if (!isOpen) return null;

  const initialValues: EnrollmentDataCreate = {
    class_: editingItem?.class_ ?? activeClass,
    category: editingItem?.category ?? 'GENERAL',
    boys: editingItem?.boys ?? 0,
    girls: editingItem?.girls ?? 0,
    below_6: editingItem?.below_6 ?? 0,
    between_6_and_11: editingItem?.between_6_and_11 ?? 0,
    above_11: editingItem?.above_11 ?? 0,
  };

  const handleSave = async (values: EnrollmentDataCreate) => {
    const toastId = toast.loading('Saving...');
    try {
      const result = editingItem
        ? await enrollmentService.updateEnrollment(editingItem.id, values)
        : await enrollmentService.createEnrollment(schoolId, values);

      onSaveSuccess(result, !!editingItem);
      toast.success(editingItem ? 'Updated successfully' : 'Created successfully', { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save record', { id: toastId });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-semibold text-gray-900">
            {editingItem ? `Edit Class ${editingItem.class_}` : `Add Class ${activeClass}`} Data
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={EnrollmentSchema}
          enableReinitialize
          onSubmit={handleSave}
        >
          {({ values, errors, isSubmitting }) => {
            const formError = (errors as Record<string, string>)[''];
            const totalStudents = (values.boys || 0) + (values.girls || 0);
            const totalAge =
              (values.below_6 || 0) +
              (values.between_6_and_11 || 0) +
              (values.above_11 || 0);

            return (
              <Form className="space-y-4">
                {formError && (
                  <div className="rounded border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Class</label>
                    <Field
                      as="select"
                      name="class_"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </Field>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Category</label>
                    <Field
                      as="select"
                      name="category"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Field>
                  </div>
                </div>

                <div className="rounded border border-blue-100 bg-blue-50/50 p-3">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-blue-900">
                    <span>GENDER</span>
                    <span>Total: {totalStudents}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput name="boys" label="Boys" />
                    <NumberInput name="girls" label="Girls" />
                  </div>
                </div>

                <div className="rounded border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-2 flex justify-between text-xs font-semibold text-gray-700">
                    <span>AGE DISTRIBUTION</span>
                    <span>Total: {totalAge}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <NumberInput name="below_6" label="< 6 yrs" />
                    <NumberInput name="between_6_and_11" label="6–11 yrs" />
                    <NumberInput name="above_11" label="11+ yrs" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 rounded bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Save</span>
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};