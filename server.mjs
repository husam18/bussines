import express from "express";
import OpenAI from "openai";
import "dotenv/config";
import { readFileSync } from "node:fs";

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const websitePages = [
  "index.html",
  "services.html",
  "pricing.html",
  "portfolio.html",
  "about.html",
  "contact.html"
];

function readPageContent(filename) {
  const html = readFileSync(new URL(filename, import.meta.url), "utf8");
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || filename;
  const mainContent = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] || "";
  const text = `${mainContent}\n${footer}`
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(?:h[1-6]|p|li|summary|dt|dd|article|section|div|a)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  return `${title}\n${text}`;
}

const websiteContext = websitePages
  .map(readPageContent)
  .join("\n\n");

app.use(express.json({ limit: "16kb" }));
app.use(express.static("."));

app.post("/api/chat", async (req, res) => {
  const message = String(req.body?.message || "").trim();

  if (!message || message.length > 1000) {
    return res.status(400).json({ error: "Please enter a message under 1000 characters." });
  }

  const history = Array.isArray(req.body?.history)
    ? req.body.history
        .filter((item) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string"
        )
        .slice(-10)
        .map((item) => ({ role: item.role, content: item.content.slice(0, 1000) }))
    : [];

  try {
    const result = await openai.responses.create({
      model: "gpt-4.1-mini",
      instructions: `You are cleanwebsite.nl's helpful website assistant. Answer clearly and warmly, and use the conversation history for context. For any question about this website, rely on the website content below. Do not invent prices, services, policies, project details, or contact information. If the website doesn't say, explain that and suggest checking the Contact page. For unrelated questions, use your general knowledge and be transparent when uncertain.

Website content:
${websiteContext}`,
      input: [...history, { role: "user", content: message }]
    });

    res.json({ reply: result.output_text || "Sorry, I couldn't prepare a reply." });
  } catch (error) {
    console.error("OpenAI request failed:", {
      status: error.status,
      code: error.code,
      message: error.message
    });

    if (error.code === "insufficient_quota" || error.code === "credit_balance_exhausted") {
      return res.status(503).json({
        error: "The AI is out of API credits. Please try again later."
      });
    }

    if (error.status === 429) {
      return res.status(503).json({
        error: "The AI is busy right now. Please wait a moment and try again."
      });
    }

    if (error.status === 401) {
      return res.status(503).json({
        error: "The AI service needs a valid API key. Please try again later."
      });
    }

    res.status(500).json({ error: "The AI assistant is temporarily unavailable." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Website running at http://localhost:${port}`));