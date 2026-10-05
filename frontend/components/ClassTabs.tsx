import React from 'react';
import { CLASSES } from '@/lib/constants';
import { EnrollmentDataResponse } from '@/types/enrollments';

interface ClassTabsProps {
  activeClass: number;
  setActiveClass: (cls: number) => void;
  enrollments: EnrollmentDataResponse[];
}

export const ClassTabs: React.FC<ClassTabsProps> = ({
  activeClass,
  setActiveClass,
  enrollments,
}) => {
  return (
    <div className="flex border-b border-gray-300 bg-white rounded-t-lg px-4 pt-3 gap-2 overflow-x-auto shadow-sm">
      {CLASSES.map((cls) => {
        const count = enrollments.filter((e) => e.class_ === cls).length;
        const isActive = activeClass === cls;

        return (
          <button
            key={cls}
            onClick={() => setActiveClass(cls)}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              isActive
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-md'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
            }`}
          >
            <span>Class {cls}</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};