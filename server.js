import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        socket.project = await projectModel.findById(projectId);
        
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Authentication error'));
        }

        socket.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
});

io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();
    console.log('User connected to project:', socket.roomId);
    socket.join(socket.roomId);

    // Handle AI requests from the toggle button
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

    // Handle regular chat messages
    socket.on('project-message', (data) => {
        io.to(socket.roomId).emit('project-message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from project:', socket.roomId);
        socket.leave(socket.roomId);
    });
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

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});