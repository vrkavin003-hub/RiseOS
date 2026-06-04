import { useEffect, useRef } from 'react';
import { useRealtime } from '../context/RealtimeContext';

export function useRealtimeEvent(eventName, handler) {
  const { socket } = useRealtime();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!socket || !eventName) return undefined;

    function listener(payload) {
      handlerRef.current?.(payload);
    }

    socket.on(eventName, listener);

    return () => {
      socket.off(eventName, listener);
    };
  }, [eventName, socket]);
}
