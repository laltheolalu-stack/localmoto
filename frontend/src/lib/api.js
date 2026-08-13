import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const submitBooking = (data) => axios.post(`${API}/bookings`, data);
export const submitEnquiry = (data) => axios.post(`${API}/enquiries`, data);
