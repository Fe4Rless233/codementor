const collaborations = new Map(); // Stores active collaboration sessions: Map<collaborationId, { code: string, participants: Map<userId, { socketId: string, username: string }> }>

module.exports = (io, socket) => {
  const { collaborationId, userId, username } = socket.handshake.query;

  if (collaborationId && userId && username) {
    if (!collaborations.has(collaborationId)) {
      collaborations.set(collaborationId, { code: '', participants: new Map() });
    }

    const session = collaborations.get(collaborationId);
    session.participants.set(userId, { socketId: socket.id, username });
    socket.join(collaborationId);

    // Send initial code and participants to the newly joined user
    socket.emit('code-update', session.code);
    io.to(collaborationId).emit('participants-update', Array.from(session.participants.values()).map(p => ({ username: p.username, id: p.socketId })));

    console.log(`User ${username} joined collaboration ${collaborationId}`);

    socket.on('code-change', ({ collaborationId: id, code }) => {
      if (collaborations.has(id)) {
        const currentSession = collaborations.get(id);
        currentSession.code = code;
        // Broadcast code changes to all other participants in the room
        socket.to(id).emit('code-update', code);
      }
    });

    socket.on('disconnect', () => {
      if (collaborations.has(collaborationId)) {
        const session = collaborations.get(collaborationId);
        session.participants.delete(userId);
        if (session.participants.size === 0) {
          collaborations.delete(collaborationId); // Clean up empty sessions
          console.log(`Collaboration ${collaborationId} is now empty and removed.`);
        } else {
          io.to(collaborationId).emit('participants-update', Array.from(session.participants.values()).map(p => ({ username: p.username, id: p.socketId })));
        }
      }
      console.log(`User ${username} left collaboration ${collaborationId}`);
    });
  }
};