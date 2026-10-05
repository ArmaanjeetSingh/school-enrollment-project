'use client';

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { X, Loader2 } from 'lucide-react';
import { SchoolResponse } from '@/types/schools';

const SchoolValidationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'School name must be at least 2 characters')
    .max(100, 'School name cannot exceed 100 characters')
    .required('School name is required'),
});

interface SchoolFormModalProps {
  isOpen: boolean;
  editingSchool: SchoolResponse | null;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function SchoolFormModal({
  isOpen,
  editingSchool,
  onClose,
  onSubmit,
}: SchoolFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-bold text-gray-900">
            {editingSchool ? 'Edit School Name' : 'Add New School'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Formik
          initialValues={{ name: editingSchool ? editingSchool.name : '' }}
          validationSchema={SchoolValidationSchema}
          enableReinitialize
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await onSubmit(values.name.trim());
              onClose();
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  School Name <span className="text-red-500">*</span>
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="e.g. Government Model Senior Secondary School"
                  className={`w-full rounded-md border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 ${
                    errors.name && touched.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="mt-1 text-xs font-medium text-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}