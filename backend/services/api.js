import axios from 'axios';

// Base API instance targeting Express backend
const API = axios.create({
  baseURL: 'http://localhost:1600/api',
});

// Automatically attach Bearer token to requests if user is logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;