import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { OpenAI } from 'openai';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Generate response for the chatbot
router.post('/chat', authMiddleware, async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }
    
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant for a development platform called ETA. You can help with programming questions, provide code examples, and offer technical advice.' },
                { role: 'user', content: message }
            ],
            max_tokens: 1000
        });
        
        const reply = response.choices[0].message.content;
        
        return res.json({
            reply,
            status: 'success'
        });
    } catch (error) {
        console.error('OpenAI API error:', error);
        return res.status(500).json({
            error: 'Failed to generate response from AI',
            details: error.message
        });
    }
});

export default router;