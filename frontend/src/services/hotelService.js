import api from './api';

const hotelService = {
    getHotels: async () => {
        const response = await api.get('/hotels');
        return response.data;
    },

    getHotelById: async (id) => {
        const response = await api.get(`/hotels/${id}`);
        return response.data;
    },

    createHotel: async (formData) => {
        const response = await api.post('/hotels', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateHotel: async (id, formData) => {
        const response = await api.put(`/hotels/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteHotel: async (id) => {
        const response = await api.delete(`/hotels/${id}`);
        return response.data;
    },

    addReview: async (id, reviewData) => {
        const response = await api.post(`/hotels/${id}/reviews`, reviewData);
        return response.data;
    },

    // Room API
    getRoomsByHotel: async (hotelId) => {
        const response = await api.get(`/rooms/hotel/${hotelId}`);
        return response.data;
    },

    createRoom: async (formData) => {
        const response = await api.post('/rooms', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateRoom: async (id, formData) => {
        const response = await api.put(`/rooms/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteRoom: async (id) => {
        const response = await api.delete(`/rooms/${id}`);
        return response.data;
    }
};

export default hotelService;
