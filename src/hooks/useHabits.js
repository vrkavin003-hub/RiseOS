import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage, habitsApi } from '../lib/api';

export function useHabits() {
  const [state, setState] = useState({
    analytics: null,
    error: '',
    isCreating: false,
    items: [],
    mutatingId: '',
    status: 'loading',
  });

  const loadHabits = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setState((current) => ({ ...current, error: '', status: 'loading' }));

    try {
      const result = await habitsApi.list();
      setState((current) => ({
        ...current,
        analytics: result.analytics || null,
        error: '',
        items: result.items || [],
        status: 'success',
      }));
      return result;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, status: 'error' }));
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await habitsApi.list();
        if (active) {
          setState((current) => ({
            ...current,
            analytics: result.analytics || null,
            error: '',
            items: result.items || [],
            status: 'success',
          }));
        }
      } catch (error) {
        if (active) setState((current) => ({ ...current, error: getApiErrorMessage(error), status: 'error' }));
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const createHabit = useCallback(
    async (payload) => {
      setState((current) => ({ ...current, error: '', isCreating: true }));

      try {
        const item = await habitsApi.create(payload);
        await loadHabits({ silent: true });
        setState((current) => ({ ...current, error: '', isCreating: false }));
        return item;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, isCreating: false }));
        throw error;
      }
    },
    [loadHabits],
  );

  const updateHabit = useCallback(
    async (id, payload) => {
      setState((current) => ({ ...current, error: '', mutatingId: id }));

      try {
        const item = await habitsApi.update(id, payload);
        await loadHabits({ silent: true });
        setState((current) => ({ ...current, error: '', mutatingId: '' }));
        return item;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [loadHabits],
  );

  const completeHabit = useCallback(
    async (id, payload) => {
      setState((current) => ({ ...current, error: '', mutatingId: id }));

      try {
        const item = await habitsApi.complete(id, payload);
        await loadHabits({ silent: true });
        setState((current) => ({ ...current, error: '', mutatingId: '' }));
        return item;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [loadHabits],
  );

  const deleteHabit = useCallback(
    async (id) => {
      setState((current) => ({ ...current, error: '', mutatingId: id }));

      try {
        await habitsApi.remove(id);
        await loadHabits({ silent: true });
        setState((current) => ({ ...current, error: '', mutatingId: '' }));
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [loadHabits],
  );

  const removeCompletion = useCallback(
    async (id, completionId) => {
      setState((current) => ({ ...current, error: '', mutatingId: id }));

      try {
        const item = await habitsApi.removeCompletion(id, completionId);
        await loadHabits({ silent: true });
        setState((current) => ({ ...current, error: '', mutatingId: '' }));
        return item;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [loadHabits],
  );

  return {
    analytics: state.analytics,
    completeHabit,
    createHabit,
    deleteHabit,
    error: state.error,
    habits: state.items,
    isCreating: state.isCreating,
    isLoading: state.status === 'loading',
    mutatingId: state.mutatingId,
    refreshHabits: loadHabits,
    removeCompletion,
    status: state.status,
    updateHabit,
  };
}
