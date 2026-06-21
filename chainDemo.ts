// chainDemo.ts
// This is the "chain" half of the assignment. A chain in LangChain is just
// a pipeline: prompt template -> model -> output parser, glued together
// with the .pipe() / LCEL syntax. No decision making here, it's a fixed
// path every time - that's the difference from the agent demo.
//
// Run with: npm run chain-demo

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { model } from "./model";
import { SessionMemory } from "./memory";

async function main() {
  const memory = new SessionMemory();

  // The prompt template is where we set the assistant's "personality" and
  // give it a slot for chat history + the new user input. {history} and
  // {input} get filled in at invoke time.
  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are StudyMate, a friendly study helper. Explain concepts clearly, " +
        "use short examples, and keep answers under 150 words unless the user " +
        "asks for more detail.",
    ],
    ["placeholder", "{history}"],
    ["human", "{input}"],
  ]);

  // LCEL pipe - this is the actual "chain". prompt formats the messages,
  // model generates a response, parser strips it down to a plain string.
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const questions = [
    "Can you explain what a closure is in JavaScript?",
    "Can you give me a one-line example of that?", // relies on memory to know "that" = closures
  ];

  for (const question of questions) {
    console.log(`\n> User: ${question}`);

    const response = await chain.invoke({
      input: question,
      history: memory.getHistory(),
    });

    console.log(`> StudyMate: ${response}`);

    memory.addUserMessage(question);
    memory.addAIMessage(response);
  }

  console.log(
    "\n(check your LangSmith project dashboard - you should see 2 traced runs here)"
  );
}

main().catch((err) => {
  console.error("Chain demo failed:", err);
  process.exit(1);
});
