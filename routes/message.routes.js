import express from 'express';
import MessageController from '../controllers/message.controller.js';
import authUser from '../middleware/auth.middleware.js';
import MessageService from '../services/message.service.js';
const router = express.Router();


// REST API Routes
router.get('/messages/:projectId', MessageController.getMessages);
router.post('/messages/:projectId', MessageController.createMessage);
router.get('/messages/single/:messageId', MessageController.getMessage);
router.put('/messages/:messageId', MessageController.updateMessage);
router.delete('/messages/:messageId', MessageController.deleteMessage);

// Socket.IO Message Handling (Attach to existing Socket.IO server)
export const setupMessageSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Handle real-time messages
    socket.on('project-message', async (data) => {
      try {
        const { message, sender, projectId } = data;

        // 1. Save to MongoDB
        const savedMessage = await MessageService.createMessage({
          content: message,
          sender: socket.user._id, // From auth middleware
          project: projectId
        });

        // 2. Broadcast to room (with populated sender data)
        const messageWithSender = {
          ...savedMessage.toObject(),
          sender: {
            _id: socket.user._id,
            email: socket.user.email
          },
          time: new Date().toLocaleTimeString()
        };

        io.to(projectId).emit('project-message', messageWithSender);

      } catch (error) {
        console.error('Socket message error:', error);
        socket.emit('message-error', { error: 'Failed to send message' });
      }
    });

    // Join project room
    socket.on('join-project', (projectId) => {
      socket.join(projectId);
      console.log(`User joined project room: ${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (projectId) => {
      socket.leave(projectId);
      console.log(`User left project room: ${projectId}`);
    });
  });
};

export default router;