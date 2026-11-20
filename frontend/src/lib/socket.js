import { io } from 'socket.io-client';
import config from '../config/config.js';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }
    }
    return socket;
  }


  socket = io(config.socketUrl, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
  });

  socket.on('connect', () => {
    // Socket connected
  });

  socket.on('connect_error', () => {
    // Socket connection error
  });

  socket.on('disconnect', () => {
    // Socket disconnected
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
