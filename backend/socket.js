import { Server } from 'socket.io';

let io;

export const init = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust this for production
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Allow clients to join event-specific rooms for live registration updates
    socket.on('subscribe_event', (eventId) => {
      if (eventId) {
        socket.join(`event_${eventId}`);
      }
    });

    socket.on('unsubscribe_event', (eventId) => {
      if (eventId) {
        socket.leave(`event_${eventId}`);
      }
    });

    // Allow admin clients to join an admin-specific room for notifications
    socket.on('join_admin', () => {
      socket.join('admin_room');
    });

    // Allow user to join their specific room for personal notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
