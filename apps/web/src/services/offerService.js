import apiClient from './apiClient';

const offerService = {
  submitOffer: async (offerData) => {
    try {
      const response = await apiClient.post('/offers', offerData);
      return response.data;
    } catch (error) {
      console.error('submitOffer Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  getLoanOffers: async (loanId) => {
    try {
      const response = await apiClient.get(`/loans/${loanId}/offers`);
      return response.data;
    } catch (error) {
      console.error('getLoanOffers Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  acceptOffer: async (offerId) => {
    try {
      const response = await apiClient.post(`/offers/${offerId}/accept`);
      return response.data;
    } catch (error) {
      console.error('acceptOffer Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  rejectOffer: async (offerId) => {
    try {
      const response = await apiClient.post(`/offers/${offerId}/reject`);
      return response.data;
    } catch (error) {
      console.error('rejectOffer Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  counterOffer: async (offerId, payload) => {
    try {
      const response = await apiClient.post(`/offers/${offerId}/counter`, payload);
      return response.data;
    } catch (error) {
      console.error('counterOffer Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  },

  getMyOffers: async () => {
    try {
      const response = await apiClient.get('/offers/my');
      return response.data;
    } catch (error) {
      console.error('getMyOffers Service Error:', error.friendlyMessage || error.message);
      throw error;
    }
  }
};

export default offerService;
