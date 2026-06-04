import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage, goalsApi } from '../lib/api';

export function useGoals() {
  const [state, setState] = useState({
    error: '',
    isCreating: false,
    items: [],
    mutatingId: '',
    status: 'loading',
  });

  useEffect(() => {
    let active = true;

    async function loadGoals() {
      setState((current) => ({ ...current, error: '', status: 'loading' }));

      try {
        const items = await goalsApi.list();
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

    loadGoals();

    return () => {
      active = false;
    };
  }, []);

  const createGoal = useCallback(async (payload) => {
    setState((current) => ({ ...current, error: '', isCreating: true }));

    try {
      const item = await goalsApi.create(payload);
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

  const updateGoal = useCallback(async (id, payload) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      const item = await goalsApi.update(id, payload);
      setState((current) => ({
        ...current,
        error: '',
        items: current.items.map((goal) => (goal._id === id ? item : goal)),
        mutatingId: '',
        status: 'success',
      }));
      return item;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, []);

  const deleteGoal = useCallback(async (id) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      await goalsApi.remove(id);
      setState((current) => ({
        ...current,
        error: '',
        items: current.items.filter((goal) => goal._id !== id),
        mutatingId: '',
        status: 'success',
      }));
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, []);

  return {
    createGoal,
    deleteGoal,
    error: state.error,
    goals: state.items,
    isCreating: state.isCreating,
    isLoading: state.status === 'loading',
    mutatingId: state.mutatingId,
    status: state.status,
    updateGoal,
  };
}
