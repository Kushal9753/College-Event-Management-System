import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Assuming the backend is on port 5000, fallback to current host
    const backendUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'], // Default to polling first then upgrade
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    setSocket(newSocket);

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
