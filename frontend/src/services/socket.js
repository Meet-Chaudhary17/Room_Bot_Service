import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket'],
    forceNew: true,
  });

  socket.on('connect', () => {
    console.log('🔌 Connected to Socket.IO Server');
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from Socket.IO Server');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};