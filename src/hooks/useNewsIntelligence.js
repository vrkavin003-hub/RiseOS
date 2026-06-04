import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage, newsApi } from '../lib/api';
import { useRealtimeEvent } from './useRealtimeEvent';

export function useNewsIntelligence() {
  const [state, setState] = useState({
    error: '',
    isRefreshing: false,
    items: [],
    mutatingId: '',
    status: 'loading',
  });

  useEffect(() => {
    let active = true;

    async function loadNews() {
      setState((current) => ({ ...current, error: '', status: 'loading' }));

      try {
        const items = await newsApi.list();
        if (active) setState((current) => ({ ...current, error: '', items, status: 'success' }));
      } catch (error) {
        if (active) {
          setState((current) => ({
            ...current,
            error: getApiErrorMessage(error),
            status: 'error',
          }));
        }
      }
    }

    loadNews();

    return () => {
      active = false;
    };
  }, []);

  const loadLatestNews = useCallback(async () => {
    try {
      const items = await newsApi.list();
      setState((current) => ({
        ...current,
        error: '',
        items,
        status: 'success',
      }));
      return items;
    } catch (error) {
      setState((current) => ({ ...current, error: getApiErrorMessage(error) }));
      throw error;
    }
  }, []);

  useRealtimeEvent('news:refresh', () => {
    loadLatestNews().catch(() => {});
  });

  const refreshNews = useCallback(async () => {
    setState((current) => ({ ...current, error: '', isRefreshing: true }));

    try {
      const items = await newsApi.refresh();
      setState((current) => ({
        ...current,
        error: '',
        isRefreshing: false,
        items,
        status: 'success',
      }));
      return items;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, isRefreshing: false }));
      throw error;
    }
  }, []);

  const saveNews = useCallback(async (id) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      const item = await newsApi.save(id);
      setState((current) => ({
        ...current,
        error: '',
        items: current.items.map((newsItem) => (newsItem._id === id ? item : newsItem)),
        mutatingId: '',
      }));
      return item;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, []);

  return {
    error: state.error,
    isLoading: state.status === 'loading',
    isRefreshing: state.isRefreshing,
    mutatingId: state.mutatingId,
    news: state.items,
    refreshNews,
    saveNews,
    status: state.status,
  };
}
