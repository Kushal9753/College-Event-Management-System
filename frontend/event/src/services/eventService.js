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
   * @param {Object} data - Event details (name, description, date, venue, etc.)
   */
  async createEvent(data) {
    try {
      const response = await api.post('/events/create', data);
      return response.data; // { success: true, data: { ...event } }
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get all active/approved events (filtered by user role on backend)
   * @param {Object} filters - Search, category, status filters
   */
  async getEvents(filters = {}) {
    try {
      const response = await api.get('/events', { params: filters });
      return response.data; // { success: true, count: X, data: [...] }
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get events created by logged-in faculty
   * @param {Object} filters - Search, category, status filters
   */
  async getMyEvents(filters = {}) {
    try {
      const response = await api.get('/events/my-events', { params: filters });
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
      const response = await api.patch(`/events/${id}/approve`);
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
      const response = await api.patch(`/events/${id}/reject`, {
        rejection_reason: reason
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Register a student for an event
   * @param {string} eventId - Event ID
   */
  async registerForEvent(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Cancel a student's registration for an event
   * @param {string} eventId - Event ID
   */
  async cancelRegistration(eventId) {
    try {
      const response = await api.delete(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get participants list for an event (Admin/Faculty)
   * @param {string} eventId - Event ID
   * @param {number} page - Page number (default 1)
   * @param {number} limit - Items per page (default 50)
   */
  async getEventParticipants(eventId, page = 1, limit = 50) {
    try {
      const response = await api.get(`/events/${eventId}/participants`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get registration count for an event (lightweight)
   * @param {string} eventId - Event ID
   */
  async getEventRegistrationCount(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/registration-count`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Archive an event
   * @param {string} id - Event ID
   */
  async archiveEvent(id) {
    try {
      const response = await api.patch(`/events/${id}/archive`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Export participants to CSV
   * @param {string} eventId - Event ID
   */
  async exportEventParticipants(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/export`, {
        responseType: 'blob'
      });
      
      // Handle file download
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

  /**
   * Mark attendance for participants
   * @param {string} eventId - Event ID
   * @param {Array} attendedIds - List of user IDs who attended
   */
  async markAttendance(eventId, attendedIds) {
    try {
      const response = await api.patch(`/events/${eventId}/attendance`, { attendedIds });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get audit logs for an event
   * @param {string} eventId - Event ID
   */
  async getEventLogs(eventId) {
    try {
      const response = await api.get(`/events/${eventId}/logs`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Add/Update winners for an event
   * @param {string} eventId - Event ID
   * @param {Array} winners - [{ student: id, position: 1 }, ...]
   */
  async addWinners(eventId, winners) {
    try {
      const response = await api.post(`/events/${eventId}/winners`, { winners });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Mark event as completed
   * @param {string} id - Event ID
   */
  async completeEvent(id) {
    try {
      const response = await api.patch(`/events/${id}/complete`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get payments for an event
   * @param {string} eventId - Event ID
   */
  async getEventPayments(eventId) {
    try {
      const response = await api.get(`/payments/event/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }
}

export default new EventService();
