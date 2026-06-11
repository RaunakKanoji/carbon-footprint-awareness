# Integrate AI Copilot for Personalized Recommendations

## Goal

Incorporate an AI assistant that analyzes the user’s carbon footprint data and provides actionable recommendations to reduce emissions. The AI should leverage OpenAI or Gemini APIs and respond with concise, practical suggestions tailored to the user’s habits.

## Implementation

1. **Obtain API Keys:** Register for an OpenAI or Google Gemini API key. Store the key in `.env.local` under `OPENAI_API_KEY` or `GEMINI_API_KEY`. Never commit secrets to version control.

2. **Design Prompt:** Create a prompt template that instructs the AI on how to respond. Example:

   ```ts
   const basePrompt = `You are a carbon footprint coach. Based on the following user data, provide three simple and actionable steps to reduce their carbon emissions. Focus on the largest categories first. Do not mention total emissions directly. Use an encouraging and non‑judgmental tone.`;
   ```

3. **Implement AI API Call:** Create a server action or API route (e.g., `/app/api/ai-recommendation/route.ts`) that:
   - Authenticates the user (via `requireAuth`).
   - Fetches the user’s recent activity data, category breakdown, and budget status from the database.
   - Constructs a prompt by injecting relevant data into the `basePrompt` and sends it to the AI model using `fetch` or an SDK.
   - Handles streaming responses if available (e.g., OpenAI’s chat completion streaming). Accumulate the response and send it back to the client.

   Example using OpenAI:

   ```ts
   import { OpenAI } from 'openai';

   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

   export async function POST(req: Request) {
     const user = await requireAuth(req);
     const userData = await getUserSummary(user.id); // aggregate data
     const prompt = `${basePrompt}\n\nUser data: ${JSON.stringify(userData)}`;
     const completion = await openai.chat.completions.create({
       model: 'gpt-4-turbo',
       messages: [{ role: 'user', content: prompt }],
       temperature: 0.7,
       max_tokens: 200,
     });
     return NextResponse.json({ message: completion.choices[0].message?.content });
   }
   ```

4. **Store AI Responses (Optional):** Save conversation history in the `Conversation` model (Task 08) for context persistence and future improvements. This helps the AI provide more consistent advice over time.

5. **Handle Errors:** Implement try/catch logic for network errors or API rate limits. Return user-friendly error messages if the AI service is unavailable.

6. **Privacy and Safety:** Ensure that only aggregated, non‑sensitive data is sent to the AI. Avoid sharing personal identifiers or exact location data. Clearly communicate in your privacy notice how data is used.

## Check When Done

- An API route or server action calls the AI model using the stored API key and returns recommendations based on user data.
- The prompt is thoughtfully constructed to yield concise, motivational, and practical suggestions.
- AI responses are displayed in the dashboard or a dedicated chat interface, and errors are handled gracefully.
- Sensitive user data is never sent to the AI; only aggregated activity metrics are used.
- Document the AI integration, prompt design, and safety considerations in `architecture-context.md` and `project-overview.md`.
