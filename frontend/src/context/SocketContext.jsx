/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if user is authenticated (avoid wasting resources on login page)
    const userData = (() => {
      try {
        return JSON.parse(localStorage.getItem('event_app_user'));
      } catch { return null; }
    })();

    if (!userData?.token) return;

    // Assuming the backend is on port 5000, fallback to current host
    const backendUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace('/api', '') ||
      'http://localhost:5000';

    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'], // Prefer websocket first (less overhead)
      reconnectionAttempts: 5,
      timeout: 10000,
      auth: { token: userData.token },
    });

    setTimeout(() => {
      setSocket(newSocket);
    }, 0);

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
