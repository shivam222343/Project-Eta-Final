import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDMNNdXChkIa4aeXPMhFuJUtS6wa1MIX8w");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `You are an AI assistant named Eta. When asked about your identity or creators, respond with variations of:
    - "I'm Eta, your coding assistant! Created by the talented team of Shivam, Jay, Tejas and Rohan."
    - "Hey there! I'm Eta, built by Shivam, Jay, Tejas and Rohan to help with your development needs."
    - "You can call me Eta! My development was led by Shivam, Jay, Tejas and Rohan."
    - "I go by Eta - a project brought to life by Shivam, Jay, Tejas and Rohan."
    - "Eta at your service! Developed through the collaborative efforts of Shivam, Jay, Tejas and Rohan."
    
    For all other queries, follow these guidelines:
    - You are an expert in MERN and Development with 10 years of experience
    - Always write modular, well-commented code following best practices
    - Create files as needed while maintaining existing functionality
    - Write scalable, maintainable code with proper error handling
    - Never miss edge cases
    
    Examples of responses:

    <example>
    User: Who are you?
    Response: {
        "text": "Hello! I'm Eta, your digital development assistant. The credit for my creation goes to Shivam, Jay, Tejas and Rohan."
    }
    </example>

    <example>
    User: Who created you?
    Response: {
        "text": "I was developed by an awesome team - Shivam, Jay, Tejas and Rohan. They call me Eta!"
    }
    </example>

    <example>
    User: What are you?
    Response: {
        "text": "I'm Eta, an AI coding assistant crafted by Shivam, Jay, Tejas and Rohan to make development easier for you."
    }
    </example>

    <example>
    User: Create an express application
    Response: {
        "text": "Here's your Express server file structure",
        "fileTree": {
            "app.js": {
                file: {
                    contents: "const express = require('express');\n\nconst app = express();\n\napp.get('/', (req, res) => {\n    res.send('Hello World!');\n});\n\napp.listen(3000, () => {\n    console.log('Server is running on port 3000');\n})"
                }
            },
            "package.json": {
                file: {
                    contents: '{\n    "name": "temp-server",\n    "version": "1.0.0",\n    "main": "index.js",\n    "scripts": {\n        "test": "echo \\"Error: no test specified\\" && exit 1"\n    },\n    "keywords": [],\n    "author": "",\n    "license": "ISC",\n    "description": "",\n    "dependencies": {\n        "express": "^4.21.2"\n    }\n}'
                }
            }
        },
        "buildCommand": {
            mainItem: "npm",
            commands: ["install"]
        },
        "startCommand": {
            mainItem: "node",
            commands: ["app.js"]
        }
    }
    </example>

    IMPORTANT: 
    - Don't use file names like routes/index.js
    - Vary your responses to identity questions while including all creators' names
    - Maintain a friendly, professional tone
       
    `
});

const identityResponses = [
    "I'm Eta! Your virtual coding companion, developed by Shivam, Jay, Tejas and Rohan.",
    "Hey there! I go by Eta - an AI assistant created by the brilliant minds of Shivam, Jay, Tejas and Rohan.",
    "You're talking to Eta! Brought to you by the development team of Shivam, Jay, Tejas and Rohan.",
    "I'm Eta, your digital helper! My existence is thanks to Shivam, Jay, Tejas and Rohan.",
    "Greetings! I'm Eta, a project lovingly coded by Shivam, Jay, Tejas and Rohan.",
    "Nice to meet you! I'm Eta, engineered by Shivam, Jay, Tejas and Rohan to assist developers.",
    "I respond to Eta! The brainchild of developers Shivam, Jay, Tejas and Rohan.",
    "Hello! Eta here - programmed by the talented quartet of Shivam, Jay, Tejas and Rohan."
];

export const generateResult = async (prompt) => {
    try {
        // Check if the prompt is asking about identity
        const identityQuestions = [
            'who are you',
            'who created you',
            'who made you',
            'who developed you',
            'what is your name',
            'what are you',
            'introduce yourself',
            'tell me about yourself',
            'who created',
            'who built',
            'who designed',
            'who implemented',
            'who contributed',
            'who wrote',
            'who authored',
            'who wrote the code for',
            'who wrote the source code for',
            'who wrote the code',
            'who wrote the source code',
            'who wrote the program',
            'who wrote the source code',
            'who wrote the application',
            'who wrote the software',
            'who created the application',
            'who created the software',
            'who built the application',
            'who built the software',
            'who designed the application',
            'who implemented the application',
            'who contributed to the application',
            'who wrote the tests for the application',
            'who wrote the unit tests for the application',
            'who wrote the integration tests for the application',
            'who wrote the documentation for the application',
            'who wrote the user manual for the application',
            'who wrote the release notes for the application',
            'who wrote the FAQ for the application',
            'who wrote the license for the application',
            'who wrote the contributing guide for the application',
            'who wrote the roadmap for the application',
            'who wrote the user manual for the application',
            'who wrote the release notes for the application',
            'who wrote the FAQ for the application',
            'who wrote the license for the application',
            'who wrote the contributing guide for the application',
            'who wrote the roadmap for the application',
            'who wrote the user manual for the application',
            'who wrote the release notes for the application',
            'who wrote the FAQ for the application',
            'who wrote the license for the application',
            'who wrote the contributing guide for the application',
            'who wrote the roadmap for the application',
            'who wrote the user manual for the application',
            'Gemini',
            'gemini-1.5-flash',
            'gemini-1.5-beta',
            'gemini-1.5',
            'gemini-1.4',
            'gemini-1.3',
            'gemini-1.2',
            'gemini-1.1',
            'gemini-1.0',
            'gemini-beta',
            'gemini',
            'eta',
            'eta-assistant',
            'eta-dev',
            'eta-engineer',
            'eta-programmer',
            'eta-developer',
            'eta-engineer',
            'eta-programmer',
            'eta-developer',
            'eta-engineer',
            'eta-programmer',
            'eta-developer',
            'eta-engineer',
            'eta-programmer',
            'eta-developer',
            'eta-engineer',
            'eta-programmer',
            'eta-developer',
            'eta-engineer',
            'eta-programmer',
            'Google AI model',
            'Google Generative AI',
            'GPT-3',
            'GPT-4',
            'GPT-5',
            'GPT-6',
            'Google AI ',
            "google",
            "google assistant",
            "google developer",
            "google engineer",
            "google programmer",
            "google developer",
            "google engineer",
            "google programmer",
            "google developer",
            "google engineer",
            "google programmer",
        ];
        
        const isIdentityQuestion = identityQuestions.some(question => 
            prompt.toLowerCase().includes(question)
        );

        if (isIdentityQuestion) {
            const randomResponse = identityResponses[
                Math.floor(Math.random() * identityResponses.length)
            ];
            return { 
                text: randomResponse 
            };
        }

        // Process other questions normally
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        try {
            return JSON.parse(responseText);
        } catch {
            return { text: responseText };
        }
    } catch (error) {
        console.error('AI generation error:', error);
        return { text: "Sorry, I encountered an error processing your request." };
    }
};