import api from './api';

const facultyService = {
  // GET all faculty
  async getAll() {
    const res = await api.get('/faculty');
    // The backend returns { success: true, data: array }
    return { data: res.data.data };
  },

  // CREATE faculty
  async create(faculty) {
    const res = await api.post('/faculty', faculty);
    return { data: res.data.data };
  },

  // UPDATE faculty
  async update(id, updates) {
    const res = await api.put(`/faculty/${id}`, updates);
    return { data: res.data.data };
  },

  // DELETE single faculty
  async delete(id) {
    const res = await api.delete(`/faculty/${id}`);
    return { data: res.data };
  },

  // DELETE multiple faculty (bulk)
  async deleteMany(ids) {
    // Current backend lacks a dedicated bulk delete. Send individual deletes.
    const promises = ids.map(id => api.delete(`/faculty/${id}`));
    await Promise.all(promises);
    return { data: { message: `${ids.length} deleted` } };
  },

  // TOGGLE status
  async toggleStatus(id) {
    const res = await api.patch(`/faculty/${id}/status`);
    return { data: res.data.data };
  },
};

// Unique values for filters (can be fetched dynamically in the future)
export const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
export const expertiseAreas = ['Machine Learning', 'VLSI Design', 'Thermodynamics', 'Cyber Security', 'Structural Engineering', 'Embedded Systems', 'Data Science', 'Robotics'];

export default facultyService;
