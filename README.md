# StudyMate — a small LangChain + TypeScript project

This is a study assistant I put together to actually learn how LangChain fits
together in TypeScript — model setup, prompts, memory, chains vs agents, and
tracing with LangSmith. It's deliberately small. No frontend, just a terminal
app, because the point was understanding the pieces, not building a product.

## What problem LangChain actually solves

If you've ever called the OpenAI API directly, you know the annoying part
isn't the API call — it's everything around it: formatting prompts
consistently, keeping track of conversation history, deciding when the model
should call a tool vs just answer, and figuring out *why* it gave a weird
answer when it does. You end up writing the same glue code in every project.

LangChain is basically that glue code, standardized. The two ideas that
matter most:

- **Chains** — a fixed pipeline. Prompt → model → parse output. Same path
  every time, no branching. Good for predictable tasks (summarize this,
  answer this in this format).
- **Agents** — the model decides what happens next. It looks at the input,
  looks at what tools it has, and picks one (or none) before answering.
  Good for "I don't know in advance what the user will ask."

This repo has an example of both.

## Why I used LangSmith

Honestly, the first time I wired up an agent with two tools, it kept calling
the wrong one and I had no idea why — was it the prompt, the tool
description, bad input parsing? Console.log only gets you so far once you've
got a multi-step agent loop.

LangSmith just shows you the whole run as a trace: every prompt that went to
the model, every tool call with the exact arguments generated, every
response, in order, with timing. It's free for a personal project, and once
you turn it on (literally just env vars, no code changes) you stop guessing.

## Project structure

```
src/
  model.ts       - LLM connection/config, the one place to swap providers
  memory.ts      - simple in-memory chat history with a context window cap
  tools.ts       - calculator + quiz generator tools the agent can call
  chainDemo.ts   - standalone demo of a basic chain (prompt -> model -> parser)
  agentDemo.ts   - standalone demo of a tool-calling agent
  index.ts       - the actual interactive CLI app, combines everything
```

## Setup

You'll need Node 18+ and an OpenAI API key.

```bash
git clone <this-repo-url>
cd studymate-langchain
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
OPENAI_API_KEY=sk-...
```

The LangSmith vars are optional but you're missing the whole point of the
assignment if you skip them. Get a free key at https://smith.langchain.com,
then set:

```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls__...
LANGCHAIN_PROJECT=studymate-assistant
```

## Running it

```bash
# the chain example - fixed prompt/model/parser pipeline, shows memory working
npm run chain-demo

# the agent example - watch it decide between calculator and quiz tool
npm run agent-demo

# the actual interactive app
npm run dev
```

In the interactive app, try something like:

```
You: what's 23 * 17?
You: quiz me on the french revolution
You: explain recursion
You: can you give an example of that
```

The last one only works because of memory — "that" only makes sense if the
model can see the previous turn.

## What to look at in LangSmith

After running any of the demos, go to your project dashboard at
smith.langchain.com. You'll see one trace per `invoke()` call. Open one of
the agent traces and you'll see:

- the exact system + user messages sent to the model
- whether it decided to call a tool, and which one
- the raw arguments it generated for that tool call (this is where you catch
  bugs — e.g. agent passing `"18% of 240"` as a string to the calculator
  instead of converting it to `0.18 * 240` first)
- the tool's return value going back into the model
- the final response

This is the actual debugging workflow: if the agent picks the wrong tool,
the trace usually tells you it's a vague tool `description` field, not a
broken prompt. If math comes out wrong, you can see whether the calculator
tool got bad input or whether eval() choked on it.

## Known rough edges

- The calculator tool uses `eval()` — fine for a local demo, would need to
  swap for something like `mathjs` before this touches anything real.
- Memory is just an array in process memory, resets every time you restart.
  No persistence by design — wasn't the point of this exercise.
- `gpt-4o-mini` is hardcoded in `model.ts` to keep API costs near zero while
  testing. Swap the model string if you want better answers.

## License

MIT, do whatever you want with it.
