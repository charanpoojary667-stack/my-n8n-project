// index.ts
// Main entry point - an interactive CLI version of StudyMate that combines
// everything: memory across turns, an agent that can decide to use tools,
// all traced through LangSmith automatically.
//
// Run with: npm run dev

import * as readline from "readline";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { model } from "./model";
import { allTools } from "./tools";
import { SessionMemory } from "./memory";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("=========================================");
  console.log(" StudyMate - terminal study assistant");
  console.log(" (type 'exit' to quit, 'clear' to reset memory)");
  console.log("=========================================\n");

  const memory = new SessionMemory();

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are StudyMate, a friendly study assistant. You can do math via " +
        "the calculator tool and quiz the user via the quiz_generator tool. " +
        "Use chat history to keep context across the conversation - if the " +
        "user says 'that' or 'it', figure out what they mean from earlier " +
        "messages. Keep answers concise.",
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = createToolCallingAgent({ llm: model, tools: allTools, prompt });
  const executor = new AgentExecutor({ agent, tools: allTools });

  while (true) {
    const userInput = await ask("You: ");

    if (userInput.trim().toLowerCase() === "exit") {
      console.log("Bye! Good luck studying.");
      break;
    }

    if (userInput.trim().toLowerCase() === "clear") {
      memory.clear();
      console.log("(memory cleared)\n");
      continue;
    }

    try {
      const result = await executor.invoke({
        input: userInput,
        chat_history: memory.getHistory(),
      });

      console.log(`StudyMate: ${result.output}\n`);

      memory.addUserMessage(userInput);
      memory.addAIMessage(result.output);
    } catch (err) {
      // Don't crash the whole session on one bad call - log it and let
      // the user keep going. This is also exactly the kind of failure
      // you'd want to go check in LangSmith afterward.
      console.error("Something went wrong on that request:", err);
      console.log("(check LangSmith trace for details - try again)\n");
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
