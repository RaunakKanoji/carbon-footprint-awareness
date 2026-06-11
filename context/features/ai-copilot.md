# AI Carbon Copilot

Read `AGENTS.md` and the `context/architecture-context.md` before starting this feature.

## Goal

Implement a conversational assistant that answers user questions about their carbon footprint and offers tailored suggestions. The assistant must operate asynchronously via Trigger.dev and use the user’s latest data to provide contextual responses.

## Implementation

- **Chat interface:** Create a chat UI on the client that displays a chronological list of messages. Include an input box that captures the user’s question and sends it on pressing Enter or clicking a send button. Automatically scroll to the latest message.
- **API endpoint:** Define a server action or API route `POST /api/ai/ask` that:
  - Validates the question length and content (reject empty or excessively long questions).
  - Retrieves the user’s recent activity data and profile information from the database.
  - Enqueues a Trigger.dev job with the question and user context.
  - Immediately responds to the client to confirm that the job was created.
- **Trigger.dev job:** Create a workflow in `trigger/ai.ts` that:
  - Builds a prompt containing the user’s question, their emissions breakdown, category totals and budget status. Include guidelines instructing the model to return at most three specific actions using encouraging language.
  - Sends the prompt to the configured AI provider (Gemini or OpenAI) and awaits the completion.
  - Saves both the user’s question and the AI’s response into the `AiMessage` table.
- **Streaming responses:** If the chosen AI provider supports streaming, stream the content back to the client through the API route using Server‑Sent Events or websockets. Otherwise, poll the job status and deliver the full response when ready.
- **History:** Provide a way for the user to view past conversations. Query the `AiMessage` table for the current user and render the message history in the chat UI.

## Check When Done

- The chat interface allows users to send questions and see their own messages and AI responses in order.
- `POST /api/ai/ask` validates input, enqueues a Trigger.dev job and returns immediately.
- The Trigger.dev workflow constructs a prompt with the user’s latest data, calls the AI model and saves the response to the database.
- AI responses reference the user’s current emissions and recommend realistic, non judgmental actions. They are limited to three suggestions.
- Past conversations are persisted in the `AiMessage` table and can be viewed by the user.
