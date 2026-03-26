import api from './api';

/**
 * Event Service
 * -------------
 * Handles all API calls related to events.
 * Uses the pre-configured Axios instance (`api.js`) which:
 * - Automatically prepends the base URL (`/api`)
 * - Injects the JWT authorization header for protected routes
 * - Contains response/error interceptors handling 401s
 */

class EventService {
  /**
   * Helper to format API errors into user-friendly messages
   */
  _handleError(error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Something went wrong with the event request');
  }

  /**
   * Create a new event
   * @param {Object} data - Event details (title, description, date, location)
   */
  async createEvent(data) {
    try {
      // POST to /api/events/create as defined in your route/controller
      const response = await api.post('/events/create', data);
      return response.data; // { success: true, data: { ...event } }
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get all active/approved events 
   */
  async getEvents() {
    try {
      const response = await api.get('/events');
      return response.data; // { success: true, count: X, data: [...] }
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get events created by logged-in faculty
   */
  async getMyEvents() {
    try {
      const response = await api.get('/events/my-events');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get all pending events (Admin only)
   */
  async getPendingEvents() {
    try {
      const response = await api.get('/events/pending');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Approve an event (Admin only)
   * @param {string} id - Event ID
   */
  async approveEvent(id) {
    try {
      const response = await api.put(`/events/${id}/approve`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Reject an event (Admin only)
   * @param {string} id - Event ID
   * @param {string} reason - Rejection reason
   */
  async rejectEvent(id, reason) {
    try {
      const response = await api.put(`/events/${id}/reject`, {
        rejection_reason: reason
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }
}

export default new EventService();
