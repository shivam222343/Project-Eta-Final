import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';
import projectRoutes from './routes/project.routes.js';
import userRoutes from './routes/user.routes.js';
import fileRoutes from './routes/file.routes.js';
import aiRoutes from './routes/ai.routes.js';
import canvasRoutes from './routes/canvas.routes.js';
import CanvasModel from './models/canvas.model.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);

// Enhanced Socket.IO CORS configuration
const allowedSocketOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://project-eta-final.vercel.app',
  'https://project-eta-frontend.onrender.com'
];

const io = new Server(server, {
  cors: {
    origin: allowedSocketOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Global variable to store public chat messages
const publicChatMessages = [];
const MAX_PUBLIC_CHAT_HISTORY = 100;

// Socket middleware for authentication
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;
        const room = socket.handshake.query.room;
        const canvasEnabled = socket.handshake.query.canvasEnabled === 'true';
        
        // If it's a public chat room, bypass project-specific checks
        if (room === 'public-chat' || canvasEnabled) {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
            } else {
                // For public chat, anonymous users are allowed
                socket.user = { username: 'Anonymous', isAnonymous: true };
            }
            return next();
        }
        
        // For project-specific rooms, perform regular validation
        if (!token) return next(new Error('Authentication token required'));
        if (!projectId) return next(new Error('Project ID required'));
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.project = await projectModel.findById(projectId);
        
        if (!socket.project) {
            return next(new Error('Project not found'));
        }
        
        // Set user info on socket object for later use
        socket.user = decoded;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication failed'));
    }
});

// Socket connection handler
io.on('connection', socket => {
    // If the connection is for a specific project
    if (socket.project) {
        socket.roomId = socket.project._id.toString();
        console.log('User connected to project:', socket.roomId);
        socket.join(socket.roomId);
        
        // AI request handler
        socket.on('ai-request', async (data) => {
            try {
                const result = await generateResult(data.message);
                
                io.to(socket.roomId).emit('project-message', {
                    message: JSON.stringify(result),
                    sender: {
                        _id: 'ai',
                        email: 'AI Assistant'
                    }
                });
            } catch (error) {
                console.error('AI request error:', error);
                socket.emit('ai-error', {
                    message: 'Failed to process AI request'
                });
            }
        });
        
        // Project message handler
        socket.on('project-message', (data) => {
            io.to(socket.roomId).emit('project-message', data);
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected from project:', socket.roomId);
            socket.leave(socket.roomId);
        });
    }
    
    // Handle public chat functionality
    if (socket.handshake.query.room === 'public-chat') {
        const publicRoomId = 'public-chat';
        console.log('User connected to public chat:', socket.id);
        socket.join(publicRoomId);
        
        // Send chat history to newly connected user
        socket.emit('publicChatHistory', publicChatMessages);
        
        // Handle join event with user info
        socket.on('joinPublicChat', (data) => {
            const username = data.username || socket.user?.username || 'Anonymous';
            console.log(`${username} joined public chat`);
            
            // Broadcast join message to all users in public chat
            const joinMessage = {
                text: `${username} has joined the chat`,
                username: 'System',
                timestamp: new Date().toISOString(),
                userId: 'system',
                isSystem: true
            };
            
            io.to(publicRoomId).emit('publicMessage', joinMessage);
        });
        
        // Handle public chat messages
        socket.on('publicMessage', (message) => {
            console.log('Public chat message received:', message.text);
            
            // Store message in history
            publicChatMessages.push(message);
            if (publicChatMessages.length > MAX_PUBLIC_CHAT_HISTORY) {
                publicChatMessages.shift();
            }
            
            // Broadcast message to all users in public chat
            io.to(publicRoomId).emit('publicMessage', message);
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected from public chat:', socket.id);
            socket.leave(publicRoomId);
        });
    }
    
    // Handle canvas functionality
    if (socket.handshake.query.canvasEnabled === 'true') {
        const canvasProjectId = socket.handshake.query.projectId;
        const canvasRoomId = `canvas-${canvasProjectId}`;
        console.log('User connected to canvas:', canvasRoomId);
        socket.join(canvasRoomId);
        
        // Handle getting canvas data
        socket.on('getCanvasData', async (data) => {
            try {
                const canvasData = await CanvasModel.findOne({ projectId: data.projectId });
                if (canvasData) {
                    socket.emit('canvasData', canvasData);
                }
            } catch (error) {
                console.error('Error fetching canvas data:', error);
            }
        });
        
        // Handle drawing
        socket.on('drawLine', (data) => {
            // Broadcast to all clients in the room except sender
            socket.to(canvasRoomId).emit('drawLine', data);
        });
        
        // Handle adding text
        socket.on('addText', (data) => {
            // Broadcast to all clients in the room except sender
            socket.to(canvasRoomId).emit('addText', data);
        });
        
        // Handle adding shapes
        socket.on('addShape', (data) => {
            // Broadcast to all clients in the room except sender
            socket.to(canvasRoomId).emit('addShape', data);
        });
        
        // Handle updating shapes
        socket.on('updateShape', (data) => {
            // Broadcast to all clients in the room except sender
            socket.to(canvasRoomId).emit('updateShape', data);
        });
        
        // Handle deleting shapes
        socket.on('deleteShape', (data) => {
            // Broadcast to all clients in the room except sender
            socket.to(canvasRoomId).emit('deleteShape', data);
        });
        
        // Handle clearing canvas
        socket.on('clearCanvas', (data) => {
            // Broadcast to all clients in the room except sender
            socket.to(canvasRoomId).emit('clearCanvas');
        });
        
        socket.on('disconnect', () => {
            console.log('User disconnected from canvas:', canvasRoomId);
            socket.leave(canvasRoomId);
        });
    }
});

// HTTP endpoint for AI requests
app.post('/ai/get', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const result = await generateResult(prompt);
        res.json(result);
    } catch (error) {
        console.error('AI endpoint error:', error);
        res.status(500).json({ error: 'Failed to process AI request' });
    }
});

// Set up routes
app.use('/projects', projectRoutes);
app.use('/users', userRoutes);
app.use('/files', fileRoutes);
app.use('/ai', aiRoutes);
app.use('/api/canvas', canvasRoutes);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});