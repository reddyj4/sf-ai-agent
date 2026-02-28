import OpenAI from "openai";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import {
  getAccounts,
  getOpportunitiesByAccount,
  createAccount,
  getOpenCases
} from "./tools.js";

dotenv.config();

const app = express();

/* =========================
   ✅ CORS CONFIGURATION
========================= */
app.use(cors({
  origin: "http://localhost:5173",  // React frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));



app.use(express.json());

/* =========================
   ✅ OPENAI SETUP
========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   ✅ TOOL DEFINITIONS
========================= */
const tools = [
  {
    type: "function",
    function: {
      name: "getAccounts",
      description: "Get top Salesforce accounts",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getOpportunitiesByAccount",
      description: "Get opportunities by account name",
      parameters: {
        type: "object",
        properties: {
          accountName: { type: "string" },
        },
        required: ["accountName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createAccount",
      description: "Create a new Salesforce account",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getOpenCases",
      description: "Get open cases from Salesforce",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

/* =========================
   ✅ CHAT ROUTE
========================= */
app.post("/chat", async (req, res) => {
  try {
    if (!req.body || !req.body.message) {
      return res.status(400).json({ error: "Message required" });
    }

    const userMessage = req.body.message;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
      tools,
      tool_choice: "auto",
    });

    const message = response.choices[0].message;

    // If OpenAI decides to call a tool
    if (message.tool_calls) {
      const toolCall = message.tool_calls[0];
      const args = JSON.parse(toolCall.function.arguments);

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
        data: result,
      });
    }

    // Normal text response
    res.json({ message: message.content });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   ✅ START SERVER
========================= */
app.listen(3000, () => {
  console.log("🚀 Agent running on http://localhost:3000");
});