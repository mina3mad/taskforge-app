import axios from 'axios';

const BASE_URL ='http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
};

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Do not attempt to refresh if the original request was login or already a refresh token attempt
    if (original?.url?.includes('/auth/login') || original?.url?.includes('/token/refresh')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${BASE_URL}/token/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  signUp: (data: { email: string; password: string; firstName: string; lastName: string; gender?: string; role?: string }) =>
    api.post('/auth/signUp', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  resetPassword: (data: { email: string; newPassword: string }) =>
    api.patch('/auth/resetPassword', data),
  logout: () => api.post('/user/logout'),
  getMe: () => api.get('/user/me'),
};

export const otpApi = {
  resendOtp: (data: { email: string; type: 'SignUp' | 'ForgetPassword' }) =>
    api.post('/otp/resendOtp', data),
  verifyUser: (data: { email: string; code: string }) =>
    api.patch('/otp/verifyUser', data),
  sendResetPasswordOtp: (email: string) =>
    api.post('/otp/sendResetPassOtp', { email }),
  checkResetOtp: (email: string, code: string) =>
    api.patch('/otp/checkResetOtp', { email, code }),
};

export const projectsApi = {
  create: (data: { name: string; description?: string }) =>
    api.post('/projects', data),
  findAll: (params?: { page?: number; limit?: number }) =>
    api.get('/projects', { params }),
  findOne: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/projects/${id}`, data),
  remove: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, email: string) =>
    api.post(`/projects/${id}/members`, { email }),
  removeMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/members/${userId}`),
};

export const tasksApi = {
  create: (projectId: string, data: { title: string; description?: string; assigneeId?: string }) =>
    api.post(`/projects/${projectId}/tasks`, data),
  findAll: (projectId: string, params?: { page?: number; limit?: number; search?: string }) =>
    api.get(`/projects/${projectId}/tasks`, { params }),
  findOne: (projectId: string, taskId: string) =>
    api.get(`/projects/${projectId}/tasks/${taskId}`),
  update: (projectId: string, taskId: string, data: { title?: string; description?: string }) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
  updateStatus: (projectId: string, taskId: string, status: string) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
  assignTask: (projectId: string, taskId: string, assigneeId: string) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}/assign`, { assigneeId }),
  deleteTask: (projectId: string, taskId: string) =>
    api.delete(`/projects/${projectId}/tasks/${taskId}`),
};
