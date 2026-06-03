import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage, journalApi } from '../lib/api';

export function useJournalEntries() {
  const [state, setState] = useState({
    error: '',
    isCreating: false,
    items: [],
    status: 'loading',
  });

  const loadEntries = useCallback(async () => {
    setState((current) => ({ ...current, error: '', status: 'loading' }));

    try {
      const items = await journalApi.list();
      setState((current) => ({ ...current, error: '', items, status: 'success' }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getApiErrorMessage(error),
        status: 'error',
      }));
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      setState((current) => ({ ...current, error: '', status: 'loading' }));

      try {
        const items = await journalApi.list();
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

    load();

    return () => {
      active = false;
    };
  }, []);

  const createEntry = useCallback(async (payload) => {
    setState((current) => ({ ...current, error: '', isCreating: true }));

    try {
      const item = await journalApi.create(payload);
      setState((current) => ({
        ...current,
        error: '',
        isCreating: false,
        items: [item, ...current.items],
        status: 'success',
      }));
      return item;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, isCreating: false }));
      throw error;
    }
  }, []);

  return {
    createEntry,
    entries: state.items,
    error: state.error,
    isCreating: state.isCreating,
    isLoading: state.status === 'loading',
    reload: loadEntries,
    status: state.status,
  };
}
