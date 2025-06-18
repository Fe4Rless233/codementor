const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = (io, socket) => {
  const { collaborationId, userId, username } = socket.handshake.query;

  socket.on('chat-message', async (messageData) => {
    if (!collaborationId || !userId || !messageData.message) {
      console.error('Invalid chat message data received:', messageData);
      return;
    }

    try {
      const savedMessage = await prisma.chatMessage.create({
        data: {
          collaborationId,
          userId,
          message: messageData.message,
          type: messageData.type || 'text',
        },
        include: {
          user: {
            select: { username: true, avatar: true },
          },
        },
      });
      io.to(collaborationId).emit('chat-message', savedMessage);
    } catch (error) {
      console.error('Failed to save chat message to DB:', error);
      socket.emit('error', { message: 'Failed to send message.' });
    }
  });
};