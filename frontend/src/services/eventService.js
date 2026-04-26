import api from './api';

/**
 * Event Service
 * -------------
 * Handles all API calls related to events.
 */

class EventService {
 _handleError(error) {
 if (error.response?.data?.message) {
 throw new Error(error.response.data.message);
 }
 throw new Error(error.message || 'Something went wrong with the event request');
 }

 // ── CRUD ──────────────────────────────────────────────

 async createEvent(data) {
 try {
 const response = await api.post('/events/create', data);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async getEvents(filters = {}) {
 try {
 const response = await api.get('/events', { params: filters });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async getEventById(eventId) {
 try {
 const response = await api.get(`/events/${eventId}`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async getMyEvents(filters = {}) {
 try {
 const response = await api.get('/events/my-events', { params: filters });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async getPendingEvents() {
 try {
 const response = await api.get('/events/pending');
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 // ── Admin Actions ─────────────────────────────────────

 async approveEvent(id) {
 try {
 const response = await api.patch(`/events/${id}/approve`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async rejectEvent(id, reason) {
 try {
 const response = await api.patch(`/events/${id}/reject`, { rejection_reason: reason });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async approveResults(eventId) {
 try {
 const response = await api.patch(`/events/${eventId}/results/approve`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async rejectResults(eventId, reason) {
 try {
 const response = await api.patch(`/events/${eventId}/results/reject`, { rejection_reason: reason });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 // ── Event Lifecycle ───────────────────────────────────

 async completeEvent(id) {
 try {
 const response = await api.patch(`/events/${id}/complete`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async deleteEvent(id) {
 try {
 const response = await api.delete(`/events/${id}`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }
 // ── Registration ──────────────────────────────────────

 async registerForEvent(eventId) {
 try {
 const response = await api.post(`/events/${eventId}/register`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async cancelRegistration(eventId) {
 try {
 const response = await api.delete(`/events/${eventId}/register`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async getEventParticipants(eventId, page = 1, limit = 50) {
 try {
 const response = await api.get(`/events/${eventId}/participants`, { params: { page, limit } });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async getEventRegistrationCount(eventId) {
 try {
 const response = await api.get(`/events/${eventId}/registration-count`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 // ── Payments ──────────────────────────────────────────

 async getEventPayments(eventId) {
 try {
 const response = await api.get(`/payments/event/${eventId}`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async submitPaymentProof(registrationId, formData) {
 try {
 const response = await api.post(`/events/registration/${registrationId}/payment`, formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async processPayment(registrationId, paymentData) {
 try {
 const response = await api.post(`/events/registration/${registrationId}/pay`, paymentData);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 // ── Winners & Results ─────────────────────────────────

 async addWinners(eventId, winners) {
 try {
 const response = await api.post(`/events/${eventId}/winners`, { winners });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 // ── Attendance & Export ───────────────────────────────

 async markAttendance(eventId, attendedIds) {
 try {
 const response = await api.patch(`/events/${eventId}/attendance`, { attendedIds });
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async getEventLogs(eventId) {
 try {
 const response = await api.get(`/events/${eventId}/logs`);
 return response.data;
 } catch (error) {
 this._handleError(error);
 }
 }

 async exportEventParticipants(eventId) {
 try {
 const response = await api.get(`/events/${eventId}/export`, { responseType: 'blob' });
 const url = window.URL.createObjectURL(new Blob([response.data]));
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `participants_${eventId}.csv`);
 document.body.appendChild(link);
 link.click();
 link.remove();
 return { success: true };
 } catch (error) {
 this._handleError(error);
 }
 }
}

export default new EventService();
