import { useCallback, useEffect, useState } from 'react';
import { adminApi, getApiErrorMessage } from '../lib/api';

const initialState = {
  content: null,
  error: '',
  health: null,
  isLoading: true,
  isRefreshing: false,
  mutatingId: '',
  overview: null,
  reports: null,
  users: [],
  usersPagination: null,
};

export function useAdminDashboard() {
  const [state, setState] = useState(initialState);

  const loadAdmin = useCallback(async ({ refreshing = false } = {}) => {
    setState((current) => ({ ...current, error: '', isLoading: !refreshing, isRefreshing: refreshing }));

    try {
      const [overview, usersPayload, reports, content, health] = await Promise.all([
        adminApi.getOverview(),
        adminApi.listUsers(),
        adminApi.getReports(),
        adminApi.getContent(),
        adminApi.getHealth(),
      ]);

      setState((current) => ({
        ...current,
        content,
        error: '',
        health,
        isLoading: false,
        isRefreshing: false,
        overview,
        reports,
        users: usersPayload.items || [],
        usersPagination: usersPayload.pagination || null,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getApiErrorMessage(error),
        isLoading: false,
        isRefreshing: false,
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    loadAdmin().catch(() => {});
  }, [loadAdmin]);

  const searchUsers = useCallback(async (params) => {
    setState((current) => ({ ...current, error: '', mutatingId: 'users' }));

    try {
      const payload = await adminApi.listUsers(params);
      setState((current) => ({
        ...current,
        error: '',
        mutatingId: '',
        users: payload.items || [],
        usersPagination: payload.pagination || null,
      }));
      return payload;
    } catch (error) {
      setState((current) => ({ ...current, error: getApiErrorMessage(error), mutatingId: '' }));
      throw error;
    }
  }, []);

  const updateUserRole = useCallback(async (id, role) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      const user = await adminApi.updateUser(id, { role });
      setState((current) => ({
        ...current,
        error: '',
        mutatingId: '',
        users: current.users.map((item) => (item._id === id ? user : item)),
      }));
      return user;
    } catch (error) {
      setState((current) => ({ ...current, error: getApiErrorMessage(error), mutatingId: '' }));
      throw error;
    }
  }, []);

  const deleteNews = useCallback(async (id) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      await adminApi.deleteNews(id);
      setState((current) => ({
        ...current,
        content: {
          ...current.content,
          news: current.content?.news?.filter((item) => item._id !== id) || [],
        },
        error: '',
        mutatingId: '',
      }));
    } catch (error) {
      setState((current) => ({ ...current, error: getApiErrorMessage(error), mutatingId: '' }));
      throw error;
    }
  }, []);

  return {
    content: state.content,
    deleteNews,
    error: state.error,
    health: state.health,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    mutatingId: state.mutatingId,
    overview: state.overview,
    refreshAdmin: () => loadAdmin({ refreshing: true }),
    reports: state.reports,
    searchUsers,
    updateUserRole,
    users: state.users,
    usersPagination: state.usersPagination,
  };
}
