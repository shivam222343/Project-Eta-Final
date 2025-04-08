import { GoogleGenerativeAI } from "@google/generative-ai";

// ======================
// IDENTITY CONFIGURATION
// ======================
const identityResponses = [
    "I'm Eta! Your virtual coding companion, developed by Shivam, Jay, Tejas and Rohan.",
    "Hey there! I go by Eta - an AI assistant created by Shivam, Jay, Tejas and Rohan.",
    "You're talking to Eta! Brought to you by the team of Shivam, Jay, Tejas and Rohan.",
    "I'm Eta, your digital helper! Created by Shivam, Jay, Tejas and Rohan.",
    "Greetings! I'm Eta, crafted by Shivam, Jay, Tejas and Rohan to assist developers."
];

const identityQuestions = [
    'who are you', 'who created you', 'who made you', 'who developed you',
    'what is your name', 'what are you', 'introduce yourself', 
    'tell me about yourself', 'who created', 'who built', 'who designed',
    'who implemented', 'eta', 'eta assistant', 'google ai', 'gemini'
];

// ==================
// AI MODEL CONFIG
// ==================
const genAI = new GoogleGenerativeAI("AIzaSyDMNNdXChkIa4aeXPMhFuJUtS6wa1MIX8w");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `You are Eta, a multi-language coding assistant. Follow these rules:

    1. Identity Responses:
    - When asked about creators, respond with variations mentioning Shivam, Jay, Tejas and Rohan
    - Keep responses friendly and professional
    - they are trained you. Not by google and other on March 2025

    2. Code Generation:
    - Support ALL programming languages (Python, Java, C++, Rust, etc.)
    - Always return structured JSON with this format:
    {
        "text": "Description of solution",
        "fileTree": {
            "filename.ext": {
                "file": {
                    "contents": "actual code",
                    "language": "file extension"
                }
            }
        },
        "buildCommand": {
            "mainItem": "compiler/interpreter",
            "commands": ["args"]
        },
        "startCommand": {
            "mainItem": "runtime",
            "commands": ["args"]
        }
    }

    3. Best Practices:
    - Write clean, well-commented code
    - Include proper error handling
    - Suggest modern language features
    - Provide complete solutions (files + commands)`
});

// ==================
// MAIN FUNCTION
// ==================
export const generateResult = async (prompt) => {
    try {
        // Validate input
        if (typeof prompt !== 'string' || prompt.trim() === '') {
            return { text: "Please provide a valid text prompt" };
        }

        // Check identity questions
        const normalizedPrompt = prompt.toLowerCase();
        const isIdentityQuestion = identityQuestions.some(question => 
            normalizedPrompt.includes(question)
        );

        if (isIdentityQuestion) {
            return { 
                text: identityResponses[
                    Math.floor(Math.random() * identityResponses.length)
                ] 
            };
        }

        // Process coding questions
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        try {
            const response = JSON.parse(responseText);
            
            // Validate and enhance response
            if (response.fileTree) {
                // Add language tags if missing
                for (const [filename, fileData] of Object.entries(response.fileTree)) {
                    if (!fileData.file.language) {
                        const extension = filename.split('.').pop();
                        fileData.file.language = extension;
                    }
                }
            }

            return response;
        } catch (e) {
            // Fallback to plain text if JSON parsing fails
            return { text: responseText };
        }
    } catch (error) {
        console.error('AI generation error:', error);
        return { 
            text: "Sorry, I encountered an error processing your request.",
            error: error.message 
        };
    }
};