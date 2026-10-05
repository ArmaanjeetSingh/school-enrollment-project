import { api } from '@/lib/api';
import {
  EnrollmentDataCreate,
  EnrollmentDataResponse,
  EnrollmentDataUpdate,
} from '@/types/enrollments';

export const enrollmentService = {
  /**
   * Create a new enrollment entry for a specific school
   * POST /schools/{school_id}/enrollments
   */
  async createEnrollment(
    schoolId: number,
    data: EnrollmentDataCreate
  ): Promise<EnrollmentDataResponse> {
    const response = await api.post<EnrollmentDataResponse>(
      `/school/${schoolId}/enrollments`,
      data
    );
    return response.data;
  },

  /**
   * Get all enrollment entries for a specific school
   * GET /schools/{school_id}/enrollments
   */
  async getSchoolEnrollments(
    schoolId: number
  ): Promise<EnrollmentDataResponse[]> {
    const response = await api.get<EnrollmentDataResponse[]>(
      `/school/${schoolId}/enrollments`
    );
    return response.data;
  },

  /**
   * Get a single enrollment entry by ID
   * GET /schools/enrollments/{enrollment_id}
   */
  async getEnrollment(enrollmentId: number): Promise<EnrollmentDataResponse> {
    const response = await api.get<EnrollmentDataResponse>(
      `/school/enrollments/${enrollmentId}`
    );
    return response.data;
  },

  /**
   * Update an enrollment entry by ID
   * PUT /schools/enrollments/{enrollment_id}
   */
  async updateEnrollment(
    enrollmentId: number,
    data: EnrollmentDataUpdate
  ): Promise<EnrollmentDataResponse> {
    const response = await api.put<EnrollmentDataResponse>(
      `/school/enrollments/${enrollmentId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an enrollment entry by ID
   * DELETE /schools/enrollments/{enrollment_id}
   */
  async deleteEnrollment(enrollmentId: number): Promise<void> {
    await api.delete(`/school/enrollments/${enrollmentId}`);
  },
};