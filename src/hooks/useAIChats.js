import { useCallback, useEffect, useMemo, useState } from 'react';
import { aiApi, getApiErrorMessage } from '../lib/api';

const welcomeMessage = {
  content: 'Welcome back. What decision, plan, or pattern are we sharpening today?',
  role: 'assistant',
};

function newestFirst(items) {
  return [...items].sort((first, second) => new Date(second.updatedAt || 0) - new Date(first.updatedAt || 0));
}

export function useAIChats() {
  const [state, setState] = useState({
    activeChatId: '',
    chats: [],
    error: '',
    isSending: false,
    messages: [welcomeMessage],
    status: 'loading',
  });

  useEffect(() => {
    let active = true;

    async function loadChats() {
      setState((current) => ({ ...current, error: '', status: 'loading' }));

      try {
        const chats = newestFirst(await aiApi.listChats());
        if (!active) return;

        const activeChat = chats[0];
        setState((current) => ({
          ...current,
          activeChatId: activeChat?._id || '',
          chats,
          error: '',
          messages: activeChat?.messages?.length ? activeChat.messages : [welcomeMessage],
          status: 'success',
        }));
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

    loadChats();

    return () => {
      active = false;
    };
  }, []);

  const selectChat = useCallback((chatId) => {
    setState((current) => {
      const chat = current.chats.find((item) => item._id === chatId);
      return {
        ...current,
        activeChatId: chat?._id || '',
        messages: chat?.messages?.length ? chat.messages : [welcomeMessage],
      };
    });
  }, []);

  const startNewChat = useCallback(() => {
    setState((current) => ({
      ...current,
      activeChatId: '',
      error: '',
      messages: [welcomeMessage],
    }));
  }, []);

  const sendMessage = useCallback(async (content) => {
    const message = content.trim();
    if (!message) return null;

    const optimisticMessage = { content: message, role: 'user' };
    setState((current) => ({
      ...current,
      error: '',
      isSending: true,
      messages: [...current.messages, optimisticMessage],
    }));

    try {
      const data = await aiApi.sendMessage({
        chatId: state.activeChatId || undefined,
        message,
      });

      setState((current) => {
        const chats = newestFirst([data.chat, ...current.chats.filter((chat) => chat._id !== data.chat._id)]);
        return {
          ...current,
          activeChatId: data.chat._id,
          chats,
          error: '',
          isSending: false,
          messages: data.chat.messages,
          status: 'success',
        };
      });

      return data.chat;
    } catch (error) {
      setState((current) => ({
        ...current,
        error: getApiErrorMessage(error),
        isSending: false,
      }));
      throw error;
    }
  }, [state.activeChatId]);

  return useMemo(
    () => ({
      activeChatId: state.activeChatId,
      chats: state.chats,
      error: state.error,
      isLoading: state.status === 'loading',
      isSending: state.isSending,
      messages: state.messages,
      selectChat,
      sendMessage,
      startNewChat,
      status: state.status,
    }),
    [selectChat, sendMessage, startNewChat, state],
  );
}
