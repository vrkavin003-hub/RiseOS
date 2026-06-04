import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage, skillsApi } from '../lib/api';

export function useSkills() {
  const [state, setState] = useState({
    error: '',
    isCreating: false,
    items: [],
    mutatingId: '',
    status: 'loading',
  });

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      setState((current) => ({ ...current, error: '', status: 'loading' }));

      try {
        const items = await skillsApi.list();
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

    loadSkills();

    return () => {
      active = false;
    };
  }, []);

  const createSkill = useCallback(async (payload) => {
    setState((current) => ({ ...current, error: '', isCreating: true }));

    try {
      const item = await skillsApi.create(payload);
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

  const updateSkill = useCallback(async (id, payload) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      const item = await skillsApi.update(id, payload);
      setState((current) => ({
        ...current,
        error: '',
        items: current.items.map((skill) => (skill._id === id ? item : skill)),
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

  const deleteSkill = useCallback(async (id) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      await skillsApi.remove(id);
      setState((current) => ({
        ...current,
        error: '',
        items: current.items.filter((skill) => skill._id !== id),
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
    createSkill,
    deleteSkill,
    error: state.error,
    isCreating: state.isCreating,
    isLoading: state.status === 'loading',
    mutatingId: state.mutatingId,
    skills: state.items,
    status: state.status,
    updateSkill,
  };
}
