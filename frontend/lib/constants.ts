import * as Yup from 'yup';

export const CATEGORIES = ['SC', 'ST', 'OBC', 'BC', 'GENERAL'] as const;
export const CLASSES = [1, 2, 3, 4, 5] as const;

export const EnrollmentSchema = Yup.object().shape({
  class_: Yup.number().required('Class is required'),
  category: Yup.string().required('Category is required'),
  boys: Yup.number().min(0, 'Count cannot be less than 0').required('Required'),
  girls: Yup.number().min(0, 'Count cannot be less than 0').required('Required'),
  below_6: Yup.number().min(0, 'Count cannot be less than 0').required('Required'),
  between_6_and_11: Yup.number().min(0, 'Count cannot be less than 0').required('Required'),
  above_11: Yup.number().min(0, 'Count cannot be less than 0').required('Required'),
}).test(
  'totals-match',
  'Total students (Boys + Girls) must match the sum of age groups.',
  function (values) {
    if (!values) return true;
    const { boys, girls, below_6, between_6_and_11, above_11 } = values;
    const genderTotal = (boys || 0) + (girls || 0);
    const ageTotal = (below_6 || 0) + (between_6_and_11 || 0) + (above_11 || 0);
    return genderTotal === ageTotal;
  }
);