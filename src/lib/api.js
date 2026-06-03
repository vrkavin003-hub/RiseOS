import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

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
