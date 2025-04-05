import MessageService from '../services/message.service.js';

class MessageController {
    // Get all messages for a project
    static async getMessages(req, res) {
        try {
            const { projectId } = req.params;
            
            if (!mongoose.Types.ObjectId.isValid(projectId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid project ID'
                });
            }

            const messages = await MessageService.getProjectMessages(projectId);
            res.json({
                success: true,
                data: messages
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
            res.status(500).json({ 
                success: false,
                error: 'Server error fetching messages' 
            });
        }
    }

    // Create a new message
    static async createMessage(req, res) {
        try {
            const { content } = req.body;
            const { projectId } = req.params;
            const senderId = req.user?._id;

            if (!content || !projectId) {
                return res.status(400).json({
                    success: false,
                    error: 'Content and project ID are required'
                });
            }

            if (!senderId) {
                return res.status(401).json({
                    success: false,
                    error: 'User authentication required'
                });
            }

            const message = await MessageService.createMessage({
                content,
                sender: senderId,
                project: projectId
            });

            res.status(201).json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error creating message:', error);
            res.status(500).json({
                success: false,
                error: error.message.includes('validation failed') 
                    ? 'Message validation failed' 
                    : 'Server error creating message'
            });
        }
    }
    
    // Update a message
    static async updateMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { content } = req.body;
            const userId = req.user._id;

            if (!content) {
                return res.status(400).json({
                    success: false,
                    error: 'Content is required'
                });
            }

            const updatedMessage = await MessageService.updateMessage(
                messageId, 
                userId, 
                { content }
            );

            if (!updatedMessage) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found or unauthorized'
                });
            }

            res.json({
                success: true,
                data: updatedMessage
            });
        } catch (error) {
            console.error('Error updating message:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Delete a message
    static async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const userId = req.user._id;

            const deleted = await MessageService.deleteMessage(messageId, userId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found or unauthorized'
                });
            }

            res.json({
                success: true,
                data: { id: messageId }
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get a single message by ID
    static async getMessage(req, res) {
        try {
            const { messageId } = req.params;
            
            const message = await MessageService.getMessageById(messageId);
            
            if (!message) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found'
                });
            }

            res.json({
                success: true,
                data: message
            });
        } catch (error) {
            console.error('Error fetching message:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}



export default MessageController;