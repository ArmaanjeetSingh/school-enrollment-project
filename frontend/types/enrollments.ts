export type CategoryEnum = string; // Replace with specific string union if defined (e.g., 'GENERAL' | 'SC' | 'ST' | 'OBC')

export interface EnrollmentDataBase {
  class_: number;
  category: CategoryEnum;
  boys: number;
  girls: number;
  below_6: number;
  between_6_and_11: number;
  above_11: number;
}

export interface EnrollmentDataCreate extends EnrollmentDataBase {}

export interface EnrollmentDataResponse extends EnrollmentDataBase {
  id: number;
}

export interface EnrollmentDataUpdate {
  class_?: number;
  category?: CategoryEnum;
  boys?: number;
  girls?: number;
  below_6?: number;
  between_6_and_11?: number;
  above_11?: number;
}