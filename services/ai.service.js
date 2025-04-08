import { GoogleGenerativeAI } from "@google/generative-ai";

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
    - Example: "I'm Eta, created by Shivam, Jay, Tejas and Rohan to help with coding!"

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

    3. Language Detection:
    - Detect language from request or use most appropriate
    - Include language-specific build/run commands

    4. Examples:

    <example>
    User: Create a Flask app
    Response: {
        "text": "Python Flask application",
        "fileTree": {
            "app.py": {
                "file": {
                    "contents": "from flask import Flask\n\napp = Flask(__name__)\n\n@app.route('/')\ndef hello():\n    return 'Hello World!'\n\nif __name__ == '__main__':\n    app.run()",
                    "language": "python"
                }
            },
            "requirements.txt": {
                "file": {
                    "contents": "flask",
                    "language": "text"
                }
            }
        },
        "buildCommand": {
            "mainItem": "pip",
            "commands": ["install", "-r", "requirements.txt"]
        },
        "startCommand": {
            "mainItem": "python",
            "commands": ["app.py"]
        }
    }
    </example>

    <example>
    User: Make a Rust CLI tool
    Response: {
        "text": "Rust command-line application",
        "fileTree": {
            "main.rs": {
                "file": {
                    "contents": "use std::env;\n\nfn main() {\n    let args: Vec<String> = env::args().collect();\n    println!(\"Arguments: {:?}\", args);\n}",
                    "language": "rust"
                }
            },
            "Cargo.toml": {
                "file": {
                    "contents": "[package]\nname = \"myapp\"\nversion = \"0.1.0\"\nedition = \"2021\"",
                    "language": "toml"
                }
            }
        },
        "buildCommand": {
            "mainItem": "cargo",
            "commands": ["build"]
        },
        "startCommand": {
            "mainItem": "cargo",
            "commands": ["run"]
        }
    }
    </example>`
});

// ... (keep your existing identityResponses and identityQuestions arrays)

export const generateResult = async (prompt) => {
    try {
        // Handle identity questions (same as before)
        const isIdentityQuestion = identityQuestions.some(question => 
            prompt.toLowerCase().includes(question)
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
            
            // Validate response structure
            if (!response.fileTree) {
                throw new Error("Invalid response format");
            }

            // Ensure language tags are added
            for (const [filename, fileData] of Object.entries(response.fileTree)) {
                if (!fileData.file.language) {
                    const extension = filename.split('.').pop();
                    fileData.file.language = extension;
                }
            }

            return response;
        } catch (e) {
            console.warn("Failed to parse JSON response:", e);
            return { 
                text: responseText,
                warning: "The AI response couldn't be structured properly" 
            };
        }
    } catch (error) {
        console.error('AI generation error:', error);
        return { 
            text: "Sorry, I encountered an error processing your request.",
            error: error.message 
        };
    }
};