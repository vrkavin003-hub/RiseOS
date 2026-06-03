let ioInstance = null;

export function registerSocket(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    socket.on('user:join', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
}

export function emitToUser(userId, event, payload) {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

export function broadcast(event, payload) {
  if (!ioInstance) return;
  ioInstance.emit(event, payload);
}
