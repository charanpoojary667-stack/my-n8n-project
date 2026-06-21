// model.ts
// Single place where we set up the LLM connection so we're not repeating
// the same config in every file. If you swap providers later (Anthropic,
// local Ollama, whatever) this is the only file you should need to touch.

import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

if (!process.env.OPENAI_API_KEY) {
  // Fail loud and early instead of letting LangChain throw a confusing
  // error three calls deep when it can't auth.
  throw new Error(
    "Missing OPENAI_API_KEY. Copy .env.example to .env and add your key."
  );
}

export const model = new ChatOpenAI({
  model: "gpt-4o-mini", // cheap + fast, good enough for a study assistant demo
  temperature: 0.3,     // low-ish temp, we want consistent study answers not creative writing
});

// LangSmith tracing is picked up automatically from env vars
// (LANGCHAIN_TRACING_V2, LANGCHAIN_API_KEY, LANGCHAIN_PROJECT) -
// no extra code needed here. That's honestly the nicest part of the setup,
// you don't have to wrap anything manually.
