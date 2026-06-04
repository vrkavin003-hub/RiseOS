import axios from 'axios';

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  const pointsToLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?/i.test(configuredUrl || '');

  if (import.meta.env.PROD && (!configuredUrl || pointsToLocalhost)) {
    return '/api';
  }

  return configuredUrl || 'http://127.0.0.1:5000/api';
}

export const API_BASE_URL = getApiBaseUrl();

const ACCESS_TOKEN_KEY = 'riseos_access_token';

function getStorage() {
  return typeof window === 'undefined' ? null : window.localStorage;
}

function readStoredAccessToken() {
  try {
    return getStorage()?.getItem(ACCESS_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

let accessToken = readStoredAccessToken();
let refreshPromise = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(nextToken) {
  accessToken = nextToken || '';

  try {
    const storage = getStorage();
    if (!storage) return;

    if (accessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    } else {
      storage.removeItem(ACCESS_TOKEN_KEY);
    }
  } catch {
    // Private browsing or locked-down storage should not break auth state.
  }
}

export function clearAccessToken() {
  setAccessToken('');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken && !config.skipAuthHeader) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

function isAuthEntryRoute(url = '') {
  return ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/auth/refresh'].some((route) =>
    url.includes(route),
  );
}

export function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh', {}, { skipAuthHeader: true, skipAuthRefresh: true })
      .then((response) => {
        setAccessToken(response.data.accessToken);
        return response.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !isAuthEntryRoute(originalRequest.url) &&
      Boolean(accessToken);

    if (!shouldRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const session = await refreshAccessToken();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(error) {
  const fieldErrors = error.response?.data?.errors;
  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors.map((fieldError) => fieldError.message).filter(Boolean).join(' ');
  }

  if (!error.response && error.code === 'ERR_NETWORK') {
    return 'RiseOS API is unreachable. Check the deployed /api/health endpoint and production environment variables.';
  }

  return error.response?.data?.message || error.message || 'Something went wrong';
}

export const authApi = {
  async forgotPassword(payload) {
    const response = await api.post('/auth/forgot-password', payload, { skipAuthHeader: true, skipAuthRefresh: true });
    return response.data;
  },
  async login(payload) {
    const response = await api.post('/auth/login', payload, { skipAuthHeader: true, skipAuthRefresh: true });
    setAccessToken(response.data.accessToken);
    return response.data;
  },
  async logout() {
    const response = await api.post('/auth/logout');
    clearAccessToken();
    return response.data;
  },
  async logoutEverywhere() {
    const response = await api.post('/auth/logout-everywhere');
    clearAccessToken();
    return response.data;
  },
  async me() {
    const response = await api.get('/auth/me');
    return response.data;
  },
  async register(payload) {
    const response = await api.post('/auth/register', payload, { skipAuthHeader: true, skipAuthRefresh: true });
    setAccessToken(response.data.accessToken);
    return response.data;
  },
  refresh: refreshAccessToken,
};

export const userApi = {
  async changeEmail(payload) {
    const response = await api.patch('/users/me/email', payload);
    return response.data;
  },
  async changePassword(payload) {
    const response = await api.patch('/users/me/password', payload);
    return response.data;
  },
  async getMe() {
    const response = await api.get('/users/me');
    return response.data.user;
  },
  async updateMe(payload) {
    const response = await api.patch('/users/me', payload);
    return response.data.user;
  },
  async uploadPhoto(file) {
    const formData = new window.FormData();
    formData.append('photo', file);
    const response = await api.post('/users/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.user;
  },
};

export const dashboardApi = {
  async getSummary() {
    const response = await api.get('/dashboard');
    return response.data.dashboard;
  },
};

export const journalApi = {
  async create(payload) {
    const response = await api.post('/journal', payload);
    return response.data.item;
  },
  async list() {
    const response = await api.get('/journal');
    return response.data.items || [];
  },
};

export const habitsApi = {
  async complete(id, payload = {}) {
    const response = await api.post(`/habits/${id}/complete`, payload);
    return response.data.item;
  },
  async create(payload) {
    const response = await api.post('/habits', payload);
    return response.data.item;
  },
  async list() {
    const response = await api.get('/habits');
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },
  async removeCompletion(id, completionId) {
    const response = await api.delete(`/habits/${id}/completions/${completionId}`);
    return response.data.item;
  },
  async update(id, payload) {
    const response = await api.patch(`/habits/${id}`, payload);
    return response.data.item;
  },
};

export const goalsApi = {
  async create(payload) {
    const response = await api.post('/goals', payload);
    return response.data.item;
  },
  async list() {
    const response = await api.get('/goals');
    return response.data.items || [];
  },
  async remove(id) {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },
  async update(id, payload) {
    const response = await api.patch(`/goals/${id}`, payload);
    return response.data.item;
  },
};

export const skillsApi = {
  async create(payload) {
    const response = await api.post('/skills', payload);
    return response.data.item;
  },
  async list() {
    const response = await api.get('/skills');
    return response.data.items || [];
  },
  async remove(id) {
    const response = await api.delete(`/skills/${id}`);
    return response.data;
  },
  async update(id, payload) {
    const response = await api.patch(`/skills/${id}`, payload);
    return response.data.item;
  },
};

export const wealthApi = {
  async createExpense(payload) {
    const response = await api.post('/wealth/expenses', payload);
    return response.data.item;
  },
  async createIncome(payload) {
    const response = await api.post('/wealth/income', payload);
    return response.data.item;
  },
  async getSummary() {
    const response = await api.get('/wealth/summary');
    return response.data;
  },
  async removeExpense(id) {
    const response = await api.delete(`/wealth/expenses/${id}`);
    return response.data;
  },
  async removeIncome(id) {
    const response = await api.delete(`/wealth/income/${id}`);
    return response.data;
  },
};

export const aiApi = {
  async listChats() {
    const response = await api.get('/ai');
    return response.data.items || [];
  },
  async sendMessage(payload) {
    const response = await api.post('/ai/chat', payload);
    return response.data;
  },
};

export const newsApi = {
  async list() {
    const response = await api.get('/news');
    return response.data.items || [];
  },
  async refresh() {
    const response = await api.post('/news/refresh');
    return response.data.items || [];
  },
  async save(id) {
    const response = await api.post(`/news/${id}/save`);
    return response.data.item;
  },
};

export const notificationsApi = {
  async list() {
    const response = await api.get('/notifications');
    return response.data;
  },
  async markAllRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
  async markRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  async refresh() {
    const response = await api.post('/notifications/refresh');
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export const friendsApi = {
  async list() {
    const response = await api.get('/friends');
    return response.data;
  },
  async remove(id) {
    const response = await api.delete(`/friends/${id}`);
    return response.data;
  },
  async request(userId) {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data.item;
  },
  async respond(id, status) {
    const response = await api.patch(`/friends/${id}`, { status });
    return response.data.item;
  },
  async search(q) {
    const response = await api.get('/friends/search', { params: { q } });
    return response.data.items || [];
  },
};

export const statusApi = {
  async create(payload) {
    const response = await api.post('/status', payload);
    return response.data.item;
  },
  async list() {
    const response = await api.get('/status');
    return response.data.items || [];
  },
  async remove(id) {
    const response = await api.delete(`/status/${id}`);
    return response.data;
  },
  async view(id) {
    const response = await api.post(`/status/${id}/view`);
    return response.data.item;
  },
};

export const adminApi = {
  async deleteNews(id) {
    const response = await api.delete(`/admin/content/news/${id}`);
    return response.data;
  },
  async getContent() {
    const response = await api.get('/admin/content');
    return response.data.content;
  },
  async getHealth() {
    const response = await api.get('/admin/health');
    return response.data.health;
  },
  async getOverview() {
    const response = await api.get('/admin/overview');
    return response.data.overview;
  },
  async getReports() {
    const response = await api.get('/admin/reports');
    return response.data.reports;
  },
  async listUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  async updateUser(id, payload) {
    const response = await api.patch(`/admin/users/${id}`, payload);
    return response.data.user;
  },
};
