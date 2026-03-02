import OpenAI from "openai";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

import {
  getAccounts,
  getOpportunitiesByAccount,
  createAccount,
  getOpenCases
} from "./tools.js";

dotenv.config();

const app = express();

// =========================
// ✅ Directory Helpers
// =========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// ✅ FRONTEND (VITE BUILD)
// Make sure `npm run build` creates /dist
// =========================
const frontendPath = path.join(__dirname, "dist");
app.use(express.static(frontendPath));

// =========================
// ✅ CORS (Only for Dev)
// =========================
if (process.env.NODE_ENV === "development") {
  app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }));
}

app.use(express.json());

// =========================
// ✅ OPENAI SETUP
// =========================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================
// ✅ TOOL DEFINITIONS
// =========================
const tools = [
  {
    type: "function",
    function: {
      name: "getAccounts",
      description: "Get top Salesforce accounts",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getOpportunitiesByAccount",
      description: "Get opportunities by account name",
      parameters: {
        type: "object",
        properties: {
          accountName: { type: "string" }
        },
        required: ["accountName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "createAccount",
      description: "Create a new Salesforce account",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getOpenCases",
      description: "Get open Salesforce cases",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

// =========================
// ✅ CHAT ROUTE
// =========================
app.post("/chat", async (req, res) => {
  try {
    if (!req.body?.message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const userMessage = req.body.message;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful Salesforce AI assistant." },
        { role: "user", content: userMessage }
      ],
      tools,
      tool_choice: "auto"
    });

    const message = response.choices[0].message;

    // 🔥 If OpenAI calls a tool
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments || "{}");

      let result;

      switch (toolCall.function.name) {
        case "getAccounts":
          result = await getAccounts(args.limit || 5);
          break;

        case "getOpportunitiesByAccount":
          result = await getOpportunitiesByAccount(args.accountName);
          break;

        case "createAccount":
          result = await createAccount(args.name);
          break;

        case "getOpenCases":
          result = await getOpenCases();
          break;

        default:
          result = { error: "Unknown tool" };
      }

      return res.json({
        toolUsed: toolCall.function.name,
        data: result
      });
    }

    // ✅ Normal text response
    return res.json({ message: message.content });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  }
});

// =========================
// ✅ SPA FALLBACK FIX
// (Fixes Node 24 + Express path error)
// =========================
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  res.sendFile(path.join(frontendPath, "index.html"));
});

// =========================
// ✅ START SERVER
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Salesforce AI Agent running on port ${PORT}`);
});