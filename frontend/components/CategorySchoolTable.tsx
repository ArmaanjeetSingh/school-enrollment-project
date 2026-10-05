import React, { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import { CategoryEnum, ReportDataResponse } from '@/types/reports';
import { CLASSES } from '@/lib/reports';

interface CategorySchoolTableProps {
  category: CategoryEnum;
  schoolIds: number[];
  reportData: ReportDataResponse[];
}

export function CategorySchoolTable({ category, schoolIds, reportData }: CategorySchoolTableProps) {
  const categoryRecords = useMemo(
    () => reportData.filter((item) => item.category === category),
    [reportData, category]
  );

  const dataLookup = useMemo(() => {
    const map: Record<number, Record<number, { boys: number; girls: number }>> = {};
    categoryRecords.forEach((item) => {
      const clsNum = Number(item.class_);
      if (!map[item.school_id]) {
        map[item.school_id] = {};
      }
      map[item.school_id][clsNum] = { boys: item.boys, girls: item.girls };
    });
    return map;
  }, [categoryRecords]);

  const columnTotals = useMemo(() => {
    const classTotals = CLASSES.reduce<Record<number, { boys: number; girls: number }>>(
      (acc, cls) => ({ ...acc, [cls]: { boys: 0, girls: 0 } }),
      {}
    );

    let overallBoys = 0;
    let overallGirls = 0;

    schoolIds.forEach((sId) => {
      CLASSES.forEach((cls) => {
        const entry = dataLookup[sId]?.[cls] || { boys: 0, girls: 0 };
        classTotals[cls].boys += entry.boys;
        classTotals[cls].girls += entry.girls;
        overallBoys += entry.boys;
        overallGirls += entry.girls;
      });
    });

    return {
      classes: classTotals,
      overallBoys,
      overallGirls,
      grandTotal: overallBoys + overallGirls,
    };
  }, [schoolIds, dataLookup]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center border-b border-black pb-1">
        <h3 className="font-bold text-sm uppercase tracking-wide text-blue-900 print:text-black flex items-center gap-2">
          <Building2 className="w-4 h-4 print:hidden" />
          <span>Category: {category} (Classes 1 to 5)</span>
        </h3>
        <span className="text-xs font-semibold text-gray-600 print:text-black">
          Category: {category}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100 print:bg-gray-200 border-b border-black font-bold text-black text-center">
              <th rowSpan={2} className="border border-black p-1.5 w-28 bg-gray-200 print:bg-gray-300">
                School Name
              </th>
              {CLASSES.map((cls) => (
                <th key={cls} colSpan={2} className="border border-black p-1">
                  Class {cls}
                </th>
              ))}
              <th colSpan={3} className="border border-black p-1 bg-gray-200 print:bg-gray-300">
                Total
              </th>
            </tr>

            <tr className="bg-gray-50 print:bg-gray-100 border-b border-black font-semibold text-black text-center text-[11px]">
              {CLASSES.map((cls) => (
                <React.Fragment key={cls}>
                  <th className="border border-black p-1 w-12">Boys</th>
                  <th className="border border-black p-1 w-12">Girls</th>
                </React.Fragment>
              ))}
              <th className="border border-black p-1 w-14">Boys</th>
              <th className="border border-black p-1 w-14">Girls</th>
              <th className="border border-black p-1 w-16 bg-gray-300 print:bg-gray-400">Total</th>
            </tr>
          </thead>

          <tbody>
            {schoolIds.length === 0 ? (
              <tr>
                <td colSpan={CLASSES.length * 2 + 4} className="text-center py-4 text-gray-500 border border-black">
                  No school data available.
                </td>
              </tr>
            ) : (
              schoolIds.map((schoolId) => {
                let schoolBoysTotal = 0;
                let schoolGirlsTotal = 0;
                const currentSchoolRecord = reportData.find((item) => item.school_id === schoolId);
                const schoolName = currentSchoolRecord?.school_name || `School #${schoolId}`;

                return (
                  <tr key={schoolId} className="text-center border-b border-black hover:bg-gray-50">
                    <td className="border border-black p-1.5 text-left font-semibold bg-gray-50 print:bg-gray-100">
                      <div className="font-bold text-gray-900 leading-snug">
                        {schoolName}
                      </div>
                    </td>

                    {CLASSES.map((cls) => {
                      const cell = dataLookup[schoolId]?.[cls] || { boys: 0, girls: 0 };
                      schoolBoysTotal += cell.boys;
                      schoolGirlsTotal += cell.girls;

                      return (
                        <React.Fragment key={cls}>
                          <td className="border border-black p-1">{cell.boys || 0}</td>
                          <td className="border border-black p-1">{cell.girls || 0}</td>
                        </React.Fragment>
                      );
                    })}

                    <td className="border border-black p-1 font-semibold">{schoolBoysTotal}</td>
                    <td className="border border-black p-1 font-semibold">{schoolGirlsTotal}</td>
                    <td className="border border-black p-1 font-bold bg-gray-100 print:bg-gray-200">
                      {schoolBoysTotal + schoolGirlsTotal}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot>
            <tr className="bg-gray-200 print:bg-gray-300 font-bold text-center border-t-2 border-black text-black">
              <td className="border border-black p-1.5 text-right">Grand Total:</td>
              {CLASSES.map((cls) => (
                <React.Fragment key={cls}>
                  <td className="border border-black p-1">{columnTotals.classes[cls].boys}</td>
                  <td className="border border-black p-1">{columnTotals.classes[cls].girls}</td>
                </React.Fragment>
              ))}
              <td className="border border-black p-1">{columnTotals.overallBoys}</td>
              <td className="border border-black p-1">{columnTotals.overallGirls}</td>
              <td className="border border-black p-1 text-blue-900 print:text-black bg-gray-400 print:bg-gray-500 text-sm">
                {columnTotals.grandTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}