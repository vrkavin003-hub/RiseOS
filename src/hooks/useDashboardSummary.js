import { useEffect, useState } from 'react';
import { dashboardApi, getApiErrorMessage } from '../lib/api';

export function useDashboardSummary() {
  const [state, setState] = useState({
    dashboard: null,
    error: '',
    status: 'loading',
  });

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setState((current) => ({ ...current, error: '', status: 'loading' }));

      try {
        const dashboard = await dashboardApi.getSummary();
        if (active) setState({ dashboard, error: '', status: 'success' });
      } catch (error) {
        if (active) {
          setState({
            dashboard: null,
            error: getApiErrorMessage(error),
            status: 'error',
          });
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return {
    dashboard: state.dashboard,
    error: state.error,
    isLoading: state.status === 'loading',
    status: state.status,
  };
}
