import api from './axios';

// Venue
export const getVenues = () => api.get('/venues');
export const createVenue = (data) => api.post('/admin/venues', data);
export const updateVenue = (id, data) => api.put(`/admin/venues/${id}`, data);
export const deleteVenue = (id) => api.delete(`/admin/venues/${id}`);

// Field
export const getFields = () => api.get('/fields');
export const createField = (data) => api.post('/admin/fields', data);
export const updateField = (id, data) => api.put(`/admin/fields/${id}`, data);
export const deleteField = (id) => api.delete(`/admin/fields/${id}`);

// Schedule
export const getSchedules = () => api.get('/schedules');
export const createSchedule = (data) => api.post('/admin/schedules', data);
export const updateSchedule = (id, data) => api.put(`/admin/schedules/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/admin/schedules/${id}`);

// Booking Confirmation
export const confirmBooking = (id) => api.post(`/admin/bookings/${id}/confirm`);
