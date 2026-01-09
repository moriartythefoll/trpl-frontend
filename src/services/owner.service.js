import api from './axios';

export const getWeeklyReport = () => api.get('/owner/reports/weekly');
export const getMonthlyReport = () => api.get('/owner/reports/monthly');
export const getYearlyReport = () => api.get('/owner/reports/yearly');
