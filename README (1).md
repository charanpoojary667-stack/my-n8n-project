# Lean AI Agent Workflow in n8n – Support Triage Agent

**Assignment:** Build a Lean AI Agent Workflow using APIs, Webhooks, and JSON  
**Student:** Charan Poojary  
**Program:** AI Agent Engineer – edQuest  

---

## What I Built

I made a support triage agent using n8n. The idea is simple – when a customer sends a message through a webhook, my workflow automatically reads it, sends it to Gemini AI to analyze the issue, and then routes the result to either Slack (if urgent) or Gmail (if normal). The customer also gets a JSON response back immediately.

I chose this use case because it felt like something real companies actually need. Instead of manually reading every support ticket, the AI handles the classification and even writes a suggested reply.

---

## How the Workflow Works

The workflow has 7 nodes total. Here's the flow:

```
Webhook → Extract Details → Gemini AI → Check Urgency → Slack (urgent) or Gmail (normal) → Respond to Webhook
```

### Node-by-Node Breakdown

**1. Webhook Node**
- Listens at POST endpoint: `/support-triage`
- Receives JSON body with: `name`, `message`, `priority`
- This is the entry point of the whole workflow

**2. Extract Details (Set Node)**
- Pulls out key fields from the raw webhook body using JSON expressions
- Fields extracted: `customerName`, `issueMessage`, `priority`, `timestamp`
- This step makes the data clean before passing to AI

**3. Gemini AI Triage (Google Gemini 1.5 Flash)**
- This is the main AI agent node
- I gave it a structured prompt telling it to classify:
  - Issue Type (Technical / Billing / General / Complaint)
  - Urgency Level (Low / Medium / High / Critical)
  - Summary of the problem
  - Which team to assign it to
  - A suggested reply to the customer
- I used `gemini-1.5-flash` because it's free and fast

**4. Check Urgency (IF Node)**
- Parses the AI's JSON response
- If urgency is `High` or `Critical` → goes to Slack
- Otherwise → goes to Gmail
- This is the routing/decision logic of the agent

**5. Slack Node (Urgent Alert)**
- Sends a formatted Slack message with all ticket details
- Only fires when AI marks issue as High/Critical

**6. Gmail Node (Normal Ticket)**
- Sends an email to the team for Low/Medium priority tickets
- Includes AI summary and suggested customer reply

**7. Respond to Webhook**
- Sends back a JSON response to whoever called the webhook
- Confirms the ticket was received and processed

---

## Sample Webhook Request

```json
POST /webhook/support-triage

{
  "name": "Rahul Sharma",
  "message": "I got charged twice for my subscription this month. Please help!",
  "priority": "high"
}
```

## Sample AI Output (from Gemini)

```json
{
  "issueType": "Billing",
  "urgency": "High",
  "summary": "Customer reports being charged twice for their monthly subscription.",
  "assignTeam": "Billing & Finance Team",
  "customerReply": "Hi Rahul, we're sorry for the inconvenience. Our billing team has been notified and will review your account within 24 hours. A refund will be processed if a duplicate charge is confirmed."
}
```

---

## What I Learned

- Webhooks are basically a way to trigger a workflow from outside using an API call
- JSON is how data moves between nodes – each node reads from `$json` which holds the previous node's output
- The Set node is useful for cleaning and structuring data before passing it ahead
- IF nodes let you add logic to your workflow – like a decision point
- Gemini AI works well for free-tier usage, especially `gemini-1.5-flash` model
- You need to parse AI JSON responses using `JSON.parse()` inside n8n expressions

---

## Challenges I Faced

- At first my IF node wasn't reading the AI output correctly because I forgot to use `JSON.parse()` on the Gemini response text
- Setting up the Slack credentials took a bit of time – had to create a Slack App and get the Bot Token
- The Gemini prompt needed to be very specific otherwise the output wasn't in proper JSON format

---

## Tools Used

| Tool | Purpose |
|------|---------|
| n8n (Cloud free tier) | Workflow automation platform |
| Google Gemini 1.5 Flash | AI analysis and classification |
| Slack | Urgent ticket notifications |
| Gmail | Normal ticket email routing |
| Webhook | Receiving incoming customer messages |

---

## Files in This Repo

- `workflow.json` – the full n8n workflow (can be imported directly into n8n)
- `README.md` – this file explaining the project

---

## How to Import the Workflow

1. Open your n8n instance
2. Go to **Workflows** → click **Import**
3. Upload the `workflow.json` file
4. Set up credentials for: Gemini API, Slack, Gmail
5. Activate the workflow
6. Copy the webhook URL and test with a POST request

---

*Built as part of AI Agent Engineer program – edQuest*
