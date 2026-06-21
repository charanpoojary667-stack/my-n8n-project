// tools.ts
// Two simple tools for the agent to pick from. Kept intentionally basic -
// the point of the assignment is showing how an agent DECIDES which tool
// to call, not building a huge tool library.

import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Tool 1: a calculator. Agents are notoriously bad at arithmetic on their
// own (they're predicting tokens, not doing math), so this is a classic
// example of why you'd give a model a tool instead of trusting it to add
// numbers itself.
export const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      // NOTE: eval() here is fine for a local demo project only.
      // Don't ship this in anything real - swap for mathjs or similar
      // if this ever leaves your laptop.
      const result = eval(expression);
      return `Result: ${result}`;
    } catch (e) {
      return `Couldn't evaluate "${expression}" - make sure it's a valid math expression.`;
    }
  },
  {
    name: "calculator",
    description:
      "Use this for any math - arithmetic, percentages, basic equations. " +
      "Input should be a valid JS math expression, e.g. '12 * 7' or '(45/9)+3'.",
    schema: z.object({
      expression: z.string().describe("A math expression to evaluate"),
    }),
  }
);

// Tool 2: generates a quick quiz question on a topic. This is a "fake"
// tool in the sense that it doesn't hit an external API - in a real app
// this might pull from a question bank or database instead.
export const quizTool = tool(
  async ({ topic }: { topic: string }) => {
    // simulating a lookup / generation step - in production swap this
    // for a real question bank, a DB call, etc.
    return (
      `Quiz question on "${topic}": ` +
      `Explain the core idea of ${topic} in your own words, then give one real-world example.`
    );
  },
  {
    name: "quiz_generator",
    description:
      "Use this when the user wants to be quizzed or tested on a topic " +
      "instead of just getting an explanation.",
    schema: z.object({
      topic: z.string().describe("The study topic to generate a quiz question about"),
    }),
  }
);

export const allTools = [calculatorTool, quizTool];
