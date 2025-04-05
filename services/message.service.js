import Message from '../models/message.model.js';
import { redisClient } from './redis.service.js';

export default class MessageService {
    // Save message to MongoDB and cache in Redis
    static async createMessage({ content, sender, project, isAI = false }) {
        const newMessage = new Message({ content, sender, project, isAI });
        await newMessage.save();

        // Cache in Redis (optional, for frequent access)
        await redisClient.set(`msg:${newMessage._id}`, JSON.stringify(newMessage));
        await redisClient.expire(`msg:${newMessage._id}`, 3600); // TTL: 1 hour

        return newMessage;
    }

    // Fetch messages from MongoDB with Redis fallback
    static async getProjectMessages(projectId, { before, limit = 20 }) {
        const cacheKey = `project:${projectId}:messages:${before || 'latest'}`;
        const cachedMessages = await redisClient.get(cacheKey);

        if (cachedMessages) {
            return JSON.parse(cachedMessages);
        }

        const query = { project: projectId };
        if (before) query.createdAt = { $lt: new Date(before) };

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('sender', 'email')
            .lean();

        // Cache in Redis for 5 minutes
        await redisClient.set(cacheKey, JSON.stringify(messages), 'EX', 300);
        return messages;
    }

    // Other CRUD operations (update, delete, etc.)
    static async updateMessage(messageId, userId, updateData) {
        const updated = await Message.findOneAndUpdate(
            { _id: messageId, sender: userId },
            updateData,
            { new: true }
        );
        if (updated) await redisClient.del(`msg:${messageId}`);
        return updated;
    }
}