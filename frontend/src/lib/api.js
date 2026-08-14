import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const submitBooking = (data) => axios.post(`${API}/bookings`, data);
export const submitEnquiry = (data) => axios.post(`${API}/enquiries`, data);

export const adminLogin = (email, password) => axios.post(`${API}/auth/login`, { email, password });
export const adminGoogleSession = (sessionId) => axios.post(`${API}/auth/session`, { session_id: sessionId });
export const adminLogout = (token) => axios.post(`${API}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}` } });

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const adminMe = (token) => axios.get(`${API}/auth/me`, authHeaders(token));
export const adminGetBookings = (token) => axios.get(`${API}/bookings`, authHeaders(token));
export const adminGetEnquiries = (token) => axios.get(`${API}/enquiries`, authHeaders(token));
export const adminUpdateBooking = (token, id, payload) => axios.patch(`${API}/bookings/${id}`, payload, authHeaders(token));
export const adminUpdateEnquiry = (token, id, status) => axios.patch(`${API}/enquiries/${id}`, { status }, authHeaders(token));
export const adminDeleteBooking = (token, id) => axios.delete(`${API}/bookings/${id}`, authHeaders(token));
export const adminDeleteEnquiry = (token, id) => axios.delete(`${API}/enquiries/${id}`, authHeaders(token));
