import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { authMiddleware } from "./auth.js";
import { tools, toolDefinitions } from "./tools.js";
import { getHistory, saveMessage } from "./memory.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Protect MCP endpoint
app.use("/mcp", authMiddleware);

// Init Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// MCP endpoint
app.post("/mcp", async (req, res) => {
  try {
    const { message, sessionId = "default" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const history = getHistory(sessionId);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [
        {
          functionDeclarations: toolDefinitions
        }
      ]
    });

    const chat = model.startChat({ history });

    // Save user message
    saveMessage(sessionId, {
      role: "user",
      parts: [{ text: message }]
    });

    const result = await chat.sendMessage(message);
    const response = result.response;

    // Check for tool call
    const functionCall = response.functionCalls()?.[0];

    if (functionCall) {
      const { name, args } = functionCall;

      if (tools[name]) {
        const toolResult = await tools[name](args || {});

        // Save tool result
        saveMessage(sessionId, {
          role: "model",
          parts: [{ text: JSON.stringify(toolResult) }]
        });

        return res.json({
          type: "tool_result",
          tool: name,
          result: toolResult
        });
      }
    }

    const text = response.text();

    // Save AI response
    saveMessage(sessionId, {
      role: "model",
      parts: [{ text }]
    });

    res.json({
      type: "text",
      output: text
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message || "Internal server error"
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Gemini MCP Server Running 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
