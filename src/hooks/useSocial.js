import { useCallback, useEffect, useState } from 'react';
import { friendsApi, getApiErrorMessage, statusApi } from '../lib/api';
import { useRealtimeEvent } from './useRealtimeEvent';

const emptyConnections = {
  accepted: [],
  incoming: [],
  outgoing: [],
  recent: [],
};

export function useSocial() {
  const [state, setState] = useState({
    connections: emptyConnections,
    error: '',
    isCreatingStatus: false,
    isLoading: true,
    isSearching: false,
    mutatingId: '',
    people: [],
    statuses: [],
  });

  const loadSocial = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setState((current) => ({ ...current, error: '', isLoading: true }));

    try {
      const [connections, statuses] = await Promise.all([friendsApi.list(), statusApi.list()]);
      setState((current) => ({
        ...current,
        connections: {
          accepted: connections.accepted || [],
          incoming: connections.incoming || [],
          outgoing: connections.outgoing || [],
          recent: connections.recent || [],
        },
        error: '',
        isLoading: false,
        statuses,
      }));
      return { connections, statuses };
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, isLoading: false }));
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [connections, statuses] = await Promise.all([friendsApi.list(), statusApi.list()]);
        if (active) {
          setState((current) => ({
            ...current,
            connections: {
              accepted: connections.accepted || [],
              incoming: connections.incoming || [],
              outgoing: connections.outgoing || [],
              recent: connections.recent || [],
            },
            error: '',
            isLoading: false,
            statuses,
          }));
        }
      } catch (error) {
        if (active) setState((current) => ({ ...current, error: getApiErrorMessage(error), isLoading: false }));
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const searchPeople = useCallback(async (q) => {
    const query = q.trim();
    if (query.length < 2) {
      setState((current) => ({ ...current, people: [] }));
      return [];
    }

    setState((current) => ({ ...current, error: '', isSearching: true }));

    try {
      const people = await friendsApi.search(query);
      setState((current) => ({ ...current, error: '', isSearching: false, people }));
      return people;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, isSearching: false }));
      throw error;
    }
  }, []);

  const sendRequest = useCallback(
    async (userId) => {
      setState((current) => ({ ...current, error: '', mutatingId: userId }));

      try {
        const item = await friendsApi.request(userId);
        await loadSocial({ silent: true });
        setState((current) => ({
          ...current,
          error: '',
          mutatingId: '',
          people: current.people.map((person) =>
            String(person._id) === String(userId)
              ? { ...person, relation: { direction: 'outgoing', requestId: item._id, status: 'pending' } }
              : person,
          ),
        }));
        return item;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [loadSocial],
  );

  const respondToRequest = useCallback(
    async (id, status) => {
      setState((current) => ({ ...current, error: '', mutatingId: id }));

      try {
        const item = await friendsApi.respond(id, status);
        await loadSocial({ silent: true });
        setState((current) => ({ ...current, error: '', mutatingId: '' }));
        return item;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [loadSocial],
  );

  const removeConnection = useCallback(
    async (id) => {
      setState((current) => ({ ...current, error: '', mutatingId: id }));

      try {
        await friendsApi.remove(id);
        await loadSocial({ silent: true });
        setState((current) => ({ ...current, error: '', mutatingId: '' }));
      } catch (error) {
        const message = getApiErrorMessage(error);
        setState((current) => ({ ...current, error: message, mutatingId: '' }));
        throw error;
      }
    },
    [loadSocial],
  );

  const createStatus = useCallback(async (payload) => {
    setState((current) => ({ ...current, error: '', isCreatingStatus: true }));

    try {
      const item = await statusApi.create(payload);
      setState((current) => ({
        ...current,
        error: '',
        isCreatingStatus: false,
        statuses: [item, ...current.statuses],
      }));
      return item;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, isCreatingStatus: false }));
      throw error;
    }
  }, []);

  const deleteStatus = useCallback(async (id) => {
    setState((current) => ({ ...current, error: '', mutatingId: id }));

    try {
      await statusApi.remove(id);
      setState((current) => ({
        ...current,
        error: '',
        mutatingId: '',
        statuses: current.statuses.filter((status) => status._id !== id),
      }));
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, []);

  const viewStatus = useCallback(async (id) => {
    try {
      const item = await statusApi.view(id);
      setState((current) => ({
        ...current,
        statuses: current.statuses.map((status) => (status._id === id ? item : status)),
      }));
      return item;
    } catch {
      return null;
    }
  }, []);

  useRealtimeEvent('friend:request', () => {
    loadSocial({ silent: true }).catch(() => {});
  });

  useRealtimeEvent('friend:update', () => {
    loadSocial({ silent: true }).catch(() => {});
  });

  useRealtimeEvent('status:update', () => {
    loadSocial({ silent: true }).catch(() => {});
  });

  return {
    connections: state.connections,
    createStatus,
    deleteStatus,
    error: state.error,
    isCreatingStatus: state.isCreatingStatus,
    isLoading: state.isLoading,
    isSearching: state.isSearching,
    mutatingId: state.mutatingId,
    people: state.people,
    refreshSocial: loadSocial,
    removeConnection,
    respondToRequest,
    searchPeople,
    sendRequest,
    statuses: state.statuses,
    viewStatus,
  };
}
