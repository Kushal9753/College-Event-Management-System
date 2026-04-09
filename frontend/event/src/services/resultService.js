import api from './api';

/**
 * Result Service
 * --------------
 * Handles all API calls related to event results.
 */

class ResultService {
  _handleError(error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Something went wrong with the result request');
  }

  /**
   * Get all results
   */
  async getAllResults() {
    try {
      const response = await api.get('/results');
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get result for a specific event
   * @param {string} eventId
   */
  async getResultByEvent(eventId) {
    try {
      const response = await api.get(`/results/${eventId}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Add a result
   * @param {Object} data - { eventId, eventName, winners: [...] }
   */
  async addResult(data) {
    try {
      const response = await api.post('/results', data);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Delete a result by its _id
   * @param {string} id
   */
  async deleteResult(id) {
    try {
      const response = await api.delete(`/results/${id}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Download result for an event
   * @param {string} eventId
   * @param {string} format - 'pdf' | 'csv'
   */
  async downloadResult(eventId, format = 'pdf') {
    try {
      const response = await api.get(`/results/${eventId}/download`, {
        params: { format },
        responseType: 'blob', // Important for file downloads
      });
      return response.data; // This will be the Blob
    } catch (error) {
      this._handleError(error);
    }
  }
}

export default new ResultService();
