import axios from "axios";

const BASE_URL = "https://localhost:7209/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (data) => api.post("/auth/login", data);

export const getMyLeaves = () => api.get("/leaves/my");
export const applyLeave = (data) => api.post("/leaves", data);
export const cancelLeave = (id) => api.put(`/leaves/${id}/cancel`);

export const getTeamRequests = () => api.get("/leaves/team");
export const approveLeave = (id) => api.put(`/leaves/${id}/approve`);
export const rejectLeave = (id, reason) => api.put(`/leaves/${id}/reject`, { reason });

export const getEmployees = () => api.get("/admin/employees");
export const getMonthlySummary = (month, year) =>
  api.get(`/admin/reports/summary?month=${month}&year=${year}`);

export default api;
