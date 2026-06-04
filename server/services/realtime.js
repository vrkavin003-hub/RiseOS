import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

let ioInstance = null;

function roomForUser(userId) {
  return `user:${userId}`;
}

export function registerSocket(io) {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const payload = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(payload.id).select('_id name role');
      if (!user) return next(new Error('Invalid session'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid session'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(roomForUser(socket.user._id));
    socket.emit('realtime:ready', { userId: socket.user._id });
  });
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance || !userId) return;
  ioInstance.to(roomForUser(userId)).emit(event, payload);
}

export function broadcast(event, payload) {
  if (!ioInstance) return;
  ioInstance.emit(event, payload);
}
