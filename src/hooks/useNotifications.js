import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage, notificationsApi } from '../lib/api';
import { useRealtimeEvent } from './useRealtimeEvent';

export function useNotifications() {
  const [state, setState] = useState({
    error: '',
    isLoading: true,
    isRefreshing: false,
    items: [],
    mutatingId: '',
    unreadCount: 0,
  });

  const applyPayload = useCallback((payload) => {
    setState((current) => ({
      ...current,
      error: '',
      isLoading: false,
      isRefreshing: false,
      items: payload.items || [],
      mutatingId: '',
      unreadCount: payload.unreadCount || 0,
    }));
  }, []);

  const loadNotifications = useCallback(
    async ({ refresh = false } = {}) => {
      setState((current) => ({ ...current, error: '', isLoading: !refresh && current.items.length === 0, isRefreshing: refresh }));

      try {
        const payload = refresh ? await notificationsApi.refresh() : await notificationsApi.list();
        applyPayload(payload);
        return payload;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, isLoading: false, isRefreshing: false }));
        throw error;
      }
    },
    [applyPayload],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const payload = await notificationsApi.list();
        if (active) applyPayload(payload);
      } catch (error) {
        if (active) setState((current) => ({ ...current, error: getApiErrorMessage(error), isLoading: false }));
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [applyPayload]);

  const markAllRead = useCallback(async () => {
    setState((current) => ({ ...current, error: '', mutatingId: 'all' }));

    try {
      const payload = await notificationsApi.markAllRead();
      applyPayload(payload);
      return payload;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, [applyPayload]);

  const markRead = useCallback(async (id) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      const payload = await notificationsApi.markRead(id);
      setState((current) => ({
        ...current,
        error: '',
        items: current.items.map((item) => (item._id === id ? payload.item : item)),
        mutatingId: '',
        unreadCount: payload.unreadCount || 0,
      }));
      return payload.item;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, []);

  const deleteNotification = useCallback(
    async (id) => {
      setState((current) => ({ ...current, error: '', mutatingId: id }));

      try {
        const payload = await notificationsApi.remove(id);
        applyPayload(payload);
        return payload;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [applyPayload],
  );

  useRealtimeEvent('notification:new', (notification) => {
    if (!notification?._id) return;

    setState((current) => {
      const exists = current.items.some((item) => item._id === notification._id);
      const items = exists
        ? current.items.map((item) => (item._id === notification._id ? notification : item))
        : [notification, ...current.items].slice(0, 80);

      return {
        ...current,
        error: '',
        isLoading: false,
        items,
        unreadCount: exists ? current.unreadCount : current.unreadCount + (notification.read ? 0 : 1),
      };
    });
  });

  return {
    deleteNotification,
    error: state.error,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    markAllRead,
    markRead,
    mutatingId: state.mutatingId,
    notifications: state.items,
    refreshNotifications: () => loadNotifications({ refresh: true }),
    unreadCount: state.unreadCount,
  };
}
