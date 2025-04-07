import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDMNNdXChkIa4aeXPMhFuJUtS6wa1MIX8w");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
    },
    systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
    
    Examples: 

    <example>
 
    response: {

    "text": "this is you fileTree structure of the express server",
    "fileTree": {
        "app.js": {
            file: {
                contents: "
                const express = require('express');

                const app = express();


                app.get('/', (req, res) => {
                    res.send('Hello World!');
                });


                app.listen(3000, () => {
                    console.log('Server is running on port 3000');
                })
                "
            
        },
    },

        "package.json": {
            file: {
                contents: "

                {
                    "name": "temp-server",
                    "version": "1.0.0",
                    "main": "index.js",
                    "scripts": {
                        "test": "echo \"Error: no test specified\" && exit 1"
                    },
                    "keywords": [],
                    "author": "",
                    "license": "ISC",
                    "description": "",
                    "dependencies": {
                        "express": "^4.21.2"
                    }
}

                
                "
                
                

            },

        },

    },
    "buildCommand": {
        mainItem: "npm",
            commands: [ "install" ]
    },

    "startCommand": {
        mainItem: "node",
            commands: [ "app.js" ]
    }
}

    user:Create an express application 
   
    </example>


    
       <example>

       user:Hello 
       response:{
       "text":"Hello, How can I help you today?"
       }
       
       </example>
    
 IMPORTANT : don't use file name like routes/index.js
       
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