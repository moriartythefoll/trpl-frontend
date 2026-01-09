import api from './axios';

// Booking (cart)
export const createBooking = () => api.post('/user/bookings');
export const getMyBookings = () => api.get('/user/bookings');

// Booking Item (add slot)
export const addBookingItem = (data) => api.post('/booking-items', data);
