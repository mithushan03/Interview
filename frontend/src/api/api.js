import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
};

export const questionApi = {
  generate: (payload) => api.post("/questions/generate", payload),
  save: (payload) => api.post("/questions/save", payload),
};

export const resumeApi = {
  upload: (formData) => api.post("/resume/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  generate: (payload) => api.post("/resume/generate-questions", payload),
};

export const jobDescriptionApi = {
  generate: (payload) => api.post("/job-description/generate-questions", payload),
  upload: (formData) => api.post("/job-description/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }),
};

export const mockApi = {
  start: (payload) => api.post("/mock/start", payload),
  evaluate: (payload) => api.post("/mock/evaluate", payload),
};

export const dashboardApi = {
  getDashboard: () => api.get("/dashboard"),
  getHistory: () => api.get("/history"),
  getSavedQuestions: () => api.get("/saved-questions"),
  deleteSession: (sessionId) => api.delete(`/sessions/${sessionId}`),
  deleteMockAnswer: (answerId) => api.delete(`/mock-answers/${answerId}`),
};

export const exportApi = {
  questionsPdf: (payload) => api.post("/export/pdf", payload, { responseType: "blob" }),
};

export default api;
