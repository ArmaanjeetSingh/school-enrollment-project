import { api } from '@/lib/api';
import { SchoolCreate, SchoolResponse, SchoolUpdate,JoinSchoolPayload} from '@/types/schools';

export const schoolService = {
  /**
   * Create a new school
   * POST /schools
   */
  async createSchool(data: SchoolCreate): Promise<SchoolResponse> {
    const response = await api.post<SchoolResponse>('/schools', data);
    return response.data;
  },

  async joinSchool(data: JoinSchoolPayload): Promise<SchoolResponse> {
   const response = await api.post("/schools/join", data);
   return response.data;
  },

  /**
   * Get all schools belonging to current user
   * GET /schools
   */
  async getMySchools(): Promise<SchoolResponse[]> {
    const response = await api.get<SchoolResponse[]>('/schools');
    return response.data;
  },

  /**
   * Get a single school by ID
   * GET /schools/{school_id}
   */
  async getSchool(schoolId: number): Promise<SchoolResponse> {
    const response = await api.get<SchoolResponse>(`/schools/${schoolId}`);
    return response.data;
  },

  /**
   * Update a school by ID
   * PUT /schools/{school_id}
   */
  async updateSchool(
    schoolId: number,
    data: SchoolUpdate
  ): Promise<SchoolResponse> {
    const response = await api.put<SchoolResponse>(`/schools/${schoolId}`, data);
    return response.data;
  },

  /**
   * Delete a school by ID
   * DELETE /schools/{school_id}
   */
  async deleteSchool(schoolId: number): Promise<void> {
    await api.delete(`/schools/${schoolId}`);
  },
};