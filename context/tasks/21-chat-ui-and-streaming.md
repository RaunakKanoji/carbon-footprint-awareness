# Build Chat UI for AI Copilot

## Goal

Provide a conversational interface where users can interact with the AI copilot. The chat UI should support sending messages, streaming the AI’s response, and persisting conversation history for future context.

## Implementation

1. **Create Chat Component:** Build a reusable `Chat` component under `src/components/chat/`. The component should:
   - Display the conversation history as a list of messages. Use a distinct style for user messages vs. AI messages.
   - Provide an input field for the user to type a message and a send button.
   - Scroll to the bottom when new messages arrive.

2. **Message Interface:** Define a TypeScript interface for chat messages:

   ```ts
   interface ChatMessage {
     id: string;
     role: 'user' | 'assistant';
     content: string;
     timestamp: number;
   }
   ```

3. **Streaming Support:** Use the browser’s `ReadableStream` API (or `EventSource` if supported) to handle streaming responses from the AI. On the server side, implement streaming in the AI recommendation API (Task 20) if the underlying model supports it. On the client side:
   - Append tokens to the last assistant message as they arrive.
   - Show a loading indicator (e.g., ellipsis) while streaming.

4. **Persist Conversation:** Save each message (user and assistant) to the `Conversation` model via an API call or server action. This allows context retrieval for future queries. Provide a `conversationId` to tie messages together.

5. **Chat Page:** Create a dedicated page at `app/copilot/page.tsx` that renders the `Chat` component. Load existing conversation history on mount by fetching messages from the backend.

6. **Security and Rate Limiting:** Sanitize user input on the server to prevent prompt injection attacks. Implement basic rate limiting to avoid spam or accidental infinite loops. Do not expose sensitive data (see Task 20).

7. **UI/UX Considerations:**
   - Use a clean, minimal style consistent with the rest of the application.
   - Support keyboard shortcuts (e.g., Enter to send, Shift+Enter for newline).
   - Auto-focus the input when the chat page loads.

## Check When Done

- Users can send messages and receive streaming AI responses in real time.
- Conversation history persists across sessions and is fetched on page load.
- The chat interface is responsive and accessible, with keyboard support and screen reader labels.
- Errors (e.g., network issues) are handled gracefully and presented to the user.
- The chat page uses the same color palette and typography defined in the global theme.
