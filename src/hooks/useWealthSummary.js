import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage, wealthApi } from '../lib/api';

const emptySummary = {
  totalExpenses: 0,
  totalIncome: 0,
};

export function useWealthSummary() {
  const [state, setState] = useState({
    error: '',
    expenses: [],
    incomes: [],
    isCreating: false,
    mutatingId: '',
    status: 'loading',
    summary: emptySummary,
  });

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setState((current) => ({ ...current, error: '', status: 'loading' }));

      try {
        const data = await wealthApi.getSummary();
        if (active) {
          setState((current) => ({
            ...current,
            error: '',
            expenses: data.expenses || [],
            incomes: data.incomes || [],
            status: 'success',
            summary: data.summary || emptySummary,
          }));
        }
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

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  const createIncome = useCallback(async (payload) => {
    setState((current) => ({ ...current, error: '', isCreating: true }));

    try {
      const item = await wealthApi.createIncome(payload);
      setState((current) => ({
        ...current,
        error: '',
        incomes: [item, ...current.incomes],
        isCreating: false,
        status: 'success',
        summary: {
          ...current.summary,
          totalIncome: Number(current.summary.totalIncome || 0) + Number(item.amount || 0),
        },
      }));
      return item;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, isCreating: false }));
      throw error;
    }
  }, []);

  const createExpense = useCallback(async (payload) => {
    setState((current) => ({ ...current, error: '', isCreating: true }));

    try {
      const item = await wealthApi.createExpense(payload);
      setState((current) => ({
        ...current,
        error: '',
        expenses: [item, ...current.expenses],
        isCreating: false,
        status: 'success',
        summary: {
          ...current.summary,
          totalExpenses: Number(current.summary.totalExpenses || 0) + Number(item.amount || 0),
        },
      }));
      return item;
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, isCreating: false }));
      throw error;
    }
  }, []);

  const deleteIncome = useCallback(async (item) => {
    setState((current) => ({ ...current, error: '', mutatingId: item._id }));

    try {
      await wealthApi.removeIncome(item._id);
      setState((current) => ({
        ...current,
        error: '',
        incomes: current.incomes.filter((income) => income._id !== item._id),
        mutatingId: '',
        summary: {
          ...current.summary,
          totalIncome: Math.max(0, Number(current.summary.totalIncome || 0) - Number(item.amount || 0)),
        },
      }));
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, []);

  const deleteExpense = useCallback(async (item) => {
    setState((current) => ({ ...current, error: '', mutatingId: item._id }));

    try {
      await wealthApi.removeExpense(item._id);
      setState((current) => ({
        ...current,
        error: '',
        expenses: current.expenses.filter((expense) => expense._id !== item._id),
        mutatingId: '',
        summary: {
          ...current.summary,
          totalExpenses: Math.max(0, Number(current.summary.totalExpenses || 0) - Number(item.amount || 0)),
        },
      }));
    } catch (error) {
      const message = getApiErrorMessage(error);
      setState((current) => ({ ...current, error: message, mutatingId: '' }));
      throw error;
    }
  }, []);

  const net = Number(state.summary.totalIncome || 0) - Number(state.summary.totalExpenses || 0);
  const savingsRate = Number(state.summary.totalIncome || 0) > 0 ? Math.round((net / Number(state.summary.totalIncome)) * 100) : 0;

  return useMemo(
    () => ({
      createExpense,
      createIncome,
      deleteExpense,
      deleteIncome,
      error: state.error,
      expenses: state.expenses,
      incomes: state.incomes,
      isCreating: state.isCreating,
      isLoading: state.status === 'loading',
      mutatingId: state.mutatingId,
      net,
      savingsRate,
      status: state.status,
      summary: state.summary,
    }),
    [createExpense, createIncome, deleteExpense, deleteIncome, net, savingsRate, state],
  );
}
