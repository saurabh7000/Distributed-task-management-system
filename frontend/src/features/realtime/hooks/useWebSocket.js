import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from 'features/auth/services/authToken'

export function useWebSocket(projectId, onMessage) {
  const clientRef = useRef(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws'}?token=${encodeURIComponent(token || '')}`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to project board events if viewing a project
        if (projectId) {
          client.subscribe(`/topic/project/${projectId}`, (msg) => {
            try { onMessage && onMessage(JSON.parse(msg.body)); } catch (e) {}
          });
        }
        // Subscribe to personal notifications globally
        client.subscribe('/user/queue/notifications', (msg) => {
          try {
            const notif = JSON.parse(msg.body);
            window.dispatchEvent(new CustomEvent('taskflow_realtime_notification', { detail: notif }));
            if (onMessage) onMessage({ type: 'NOTIFICATION', payload: notif });
          } catch (e) {}
        });
      },
      onStompError: (frame) => console.error('STOMP error:', frame),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current?.active) clientRef.current.deactivate();
    };
  }, [projectId, onMessage]);

  const publish = useCallback((destination, body) => {
    if (clientRef.current?.active) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) });
    }
  }, []);

  return { publish };
}

