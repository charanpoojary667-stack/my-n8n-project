// agentDemo.ts
// This is the "agent" half. Unlike the chain (fixed path), an agent looks
// at the user's input and the tools available, and DECIDES on its own
// whether it needs a tool, which one, and what to pass it. That decision
// loop is the whole point - and it's also exactly what you want to watch
// happen in LangSmith when something goes wrong.
//
// Run with: npm run agent-demo

import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { model } from "./model";
import { allTools } from "./tools";

async function main() {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are StudyMate, a study assistant. You have access to a calculator " +
        "and a quiz generator tool. Use them when relevant - don't try to do " +
        "math in your head, and don't make up quiz questions yourself if the " +
        "quiz tool is available. If neither tool applies, just answer normally.",
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"], // this is where the agent's tool-call reasoning gets injected
  ]);

  const agent = createToolCallingAgent({
    llm: model,
    tools: allTools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools: allTools,
    verbose: true, // prints each step to console - handy before you even open LangSmith
  });

  const testInputs = [
    "What's 18% of 240?",                          // should trigger calculator
    "Quiz me on photosynthesis",                    // should trigger quiz_generator
    "What's the capital of France?",                // shouldn't trigger any tool
  ];

  for (const input of testInputs) {
    console.log(`\n========================================`);
    console.log(`> User: ${input}`);
    const result = await executor.invoke({ input });
    console.log(`> StudyMate: ${result.output}`);
  }

  console.log(
    "\nOpen your LangSmith project now - you'll see 3 separate traces. " +
      "Click into the calculator one and you'll see the exact tool call " +
      "args the model generated, which is the whole reason tracing is useful " +
      "when an agent picks the wrong tool or passes bad arguments."
  );
}

main().catch((err) => {
  console.error("Agent demo failed:", err);
  process.exit(1);
});
