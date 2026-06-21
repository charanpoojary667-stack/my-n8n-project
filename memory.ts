// memory.ts
// Handles conversation memory. We're keeping this dead simple - an in-memory
// array of messages per session. For a real product you'd back this with
// Redis or a DB, but for the assignment this is enough to show the concept
// of context carrying across turns.

import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

export class SessionMemory {
  private messages: BaseMessage[] = [];
  private readonly maxTurns: number;

  constructor(maxTurns = 10) {
    // crude context window management: only keep the last N turns.
    // not elegant, but it stops the prompt from growing forever during
    // a long study session and blowing past token limits.
    this.maxTurns = maxTurns;
  }

  addUserMessage(content: string) {
    this.messages.push(new HumanMessage(content));
    this.trim();
  }

  addAIMessage(content: string) {
    this.messages.push(new AIMessage(content));
    this.trim();
  }

  getHistory(): BaseMessage[] {
    return this.messages;
  }

  private trim() {
    // keep last maxTurns*2 messages (user + ai pairs)
    const limit = this.maxTurns * 2;
    if (this.messages.length > limit) {
      this.messages = this.messages.slice(this.messages.length - limit);
    }
  }

  clear() {
    this.messages = [];
  }
}
