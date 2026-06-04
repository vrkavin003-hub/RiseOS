import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL, getAccessToken } from '../lib/api';

const RealtimeContext = createContext(null);

function getSocketUrl() {
  if (API_BASE_URL.startsWith('/')) {
    return window.location.origin;
  }

  try {
    return new window.URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
}

export function RealtimeProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    const token = getAccessToken();

    if (!isAuthenticated || !user?._id || !token) {
      setSocket((currentSocket) => {
        currentSocket?.disconnect();
        return null;
      });
      setStatus('idle');
      return undefined;
    }

    const nextSocket = io(getSocketUrl(), {
      auth: { token },
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    setSocket(nextSocket);
    setStatus('connecting');

    nextSocket.on('connect', () => setStatus('connected'));
    nextSocket.on('connect_error', () => setStatus('error'));
    nextSocket.on('disconnect', () => setStatus('disconnected'));
    nextSocket.on('reconnect_attempt', () => setStatus('connecting'));

    return () => {
      nextSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const value = useMemo(
    () => ({
      isConnected: status === 'connected',
      socket,
      status,
    }),
    [socket, status],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }

  return context;
}
