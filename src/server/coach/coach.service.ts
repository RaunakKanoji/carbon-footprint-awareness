import { z } from 'zod';

import { NextResponse } from 'next/server';

import { prisma } from '@/src/db/prisma';
import { ConversationRole } from '@/src/generated/prisma';
import { getCurrentUser } from '@/src/lib/auth';

const copilotPostSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  conversationId: z.string().optional(),
});

const COPILOT_MAX_OUTPUT_TOKENS = 3000;

export async function createCoachResponse(req: Request) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = copilotPostSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { message, conversationId } = result.data;

    // 1. Gather Carbon Footprint Context
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);

    // Aggregate monthly logs
    const logs = await prisma.activityLog.findMany({
      where: {
        userId: dbUser.id,
        occurredAt: {
          gte: currentMonthStart,
          lt: nextMonthStart,
        },
      },
    });

    const breakdown: Record<string, number> = {
      TRANSPORT: 0,
      FOOD: 0,
      ENERGY: 0,
      SHOPPING: 0,
      WASTE: 0,
    };

    let totalEmissions = 0;
    logs.forEach((log) => {
      const cat = log.category.toUpperCase();
      if (cat in breakdown) {
        breakdown[cat] += log.co2eKg;
        totalEmissions += log.co2eKg;
      }
    });

    // Get active budget
    const budget = await prisma.budget.findUnique({
      where: {
        userId_month: {
          userId: dbUser.id,
          month: currentMonthStart,
        },
      },
    });
    const monthlyBudget = budget?.targetKg ?? 500;

    const [activeChallenges, recentProductScans] = await Promise.all([
      prisma.challenge.findMany({
        where: {
          userId: dbUser.id,
          status: 'ACTIVE',
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: 5,
        select: {
          title: true,
          description: true,
        },
      }),
      prisma.productScan.findMany({
        where: {
          userId: dbUser.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          productName: true,
          brand: true,
          carbonEstimated: true,
        },
      }),
    ]);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 6);
    const weeklyEmissions = logs
      .filter((log) => log.occurredAt >= weekStart)
      .reduce((sum, log) => sum + log.co2eKg, 0);

    // Identify highest category
    const highestCategory = Object.entries(breakdown).reduce(
      (max, [category, value]) => (value > max.value ? { category, value } : max),
      { category: 'None', value: 0 },
    );

    // Get baseline profile configurations
    const profile = dbUser.profile;
    const diet = profile?.dietType || 'balanced';
    const vehicle = profile?.commuteMode || 'none';

    // 2. Retrieve or Create Conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation || conversation.userId !== dbUser.id) {
        return NextResponse.json(
          { success: false, error: 'Conversation not found' },
          { status: 404 },
        );
      }
    } else {
      // Create new conversation
      const previewText = message.length > 30 ? `${message.substring(0, 30)}…` : message;
      conversation = await prisma.conversation.create({
        data: {
          userId: dbUser.id,
          title: `Discussion: ${previewText}`,
        },
      });
    }

    // Load previous messages
    const previousMessages = await prisma.conversationMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Define System Prompt Context
    const systemPrompt = `You are a personal encouraging Carbon Compass Coach. 
Your goal is to help the user reduce their carbon footprint with positive, encouraging, non-judgmental, and practical advice.
Do not mention their total emissions number directly unless they ask.
Instead of using complex formulas, focus on actionable daily life changes.

User's Profile context:
- Diet Style: ${diet}
- Commuting Vehicle: ${vehicle}

User's current calendar month emissions:
- Total emissions logged this month: ${totalEmissions.toFixed(1)} kg CO2e
- Emissions logged in the last 7 days: ${weeklyEmissions.toFixed(1)} kg CO2e
- Month target budget: ${monthlyBudget.toFixed(0)} kg CO2e
- Category Breakdown:
  * Transport: ${breakdown.TRANSPORT.toFixed(1)} kg CO2e
  * Food: ${breakdown.FOOD.toFixed(1)} kg CO2e
  * Energy: ${breakdown.ENERGY.toFixed(1)} kg CO2e
  * Shopping: ${breakdown.SHOPPING.toFixed(1)} kg CO2e
  * Waste: ${breakdown.WASTE.toFixed(1)} kg CO2e
- Highest emission source: ${highestCategory.category} (${highestCategory.value.toFixed(1)} kg CO2e)
- Active challenges: ${
      activeChallenges.length > 0
        ? activeChallenges.map((challenge) => challenge.title).join(', ')
        : 'None'
    }
- Recent product scans: ${
      recentProductScans.length > 0
        ? recentProductScans
            .map((scan) => [scan.brand, scan.productName].filter(Boolean).join(' '))
            .filter(Boolean)
            .join(', ')
        : 'None'
    }

Only use the user data listed above. If a requested personal statistic is unavailable, say that it has not been recorded yet.`;

    // 4. Invoke LLM or Fallback Mock
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    const isOpenAiConfigured = openAiKey && openAiKey !== 'your_openai_api_key';
    const isGeminiConfigured = geminiKey && geminiKey !== 'your_gemini_api_key';

    const encoder = new TextEncoder();

    if (isGeminiConfigured) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${geminiKey}`;
            const history = previousMessages.map((m) => ({
              role: m.role === ConversationRole.USER ? 'user' : 'model',
              parts: [{ text: m.content }],
            }));

            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [...history, { role: 'user', parts: [{ text: message }] }],
                systemInstruction: {
                  parts: [{ text: systemPrompt }],
                },
                generationConfig: {
                  maxOutputTokens: COPILOT_MAX_OUTPUT_TOKENS,
                  temperature: 0.7,
                },
              }),
            });

            if (!response.ok) {
              throw new Error(`Gemini request failed: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
              throw new Error('Response body is not readable');
            }

            const decoder = new TextDecoder('utf-8');
            let fullText = '';
            let buffer = '';
            let braceCount = 0;
            let inString = false;
            let escapeNext = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              for (let i = 0; i < chunk.length; i++) {
                const char = chunk[i];
                buffer += char;

                if (escapeNext) {
                  escapeNext = false;
                  continue;
                }

                if (char === '\\') {
                  escapeNext = true;
                  continue;
                }

                if (char === '"') {
                  inString = !inString;
                  continue;
                }

                if (!inString) {
                  if (char === '{') {
                    if (braceCount === 0) {
                      buffer = '{';
                    }
                    braceCount++;
                  } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0 && buffer.trim().startsWith('{')) {
                      try {
                        const parsed = JSON.parse(buffer);
                        const parts = parsed.candidates?.[0]?.content?.parts;
                        const text = Array.isArray(parts)
                          ? parts.map((part) => part.text || '').join('')
                          : '';
                        if (text) {
                          fullText += text;
                          controller.enqueue(encoder.encode(text));
                        }
                      } catch {
                        // ignore parsing error
                      }
                      buffer = '';
                    }
                  }
                }
              }
            }

            // Save messages to database at the end of successful streaming
            await persistMessages(conversation.id, message, fullText);
            controller.close();
          } catch (err) {
            console.error('Gemini Stream Error:', err);
            // Fallback to local mock response
            const fallbackResponse = generateLocalMockResponse(
              message,
              breakdown,
              highestCategory.category,
              monthlyBudget,
              totalEmissions,
            );
            controller.enqueue(encoder.encode(fallbackResponse));
            await persistMessages(conversation.id, message, fallbackResponse);
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'x-conversation-id': conversation.id,
        },
      });
    }

    if (isOpenAiConfigured) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const history = previousMessages.map((m) => ({
              role: m.role === ConversationRole.USER ? 'user' : 'assistant',
              content: m.content,
            }));

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openAiKey}`,
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: systemPrompt },
                  ...history,
                  { role: 'user', content: message },
                ],
                max_tokens: COPILOT_MAX_OUTPUT_TOKENS,
                temperature: 0.7,
              }),
            });

            if (!response.ok) {
              throw new Error(`OpenAI request failed: ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse = data.choices?.[0]?.message?.content || '';

            const words = aiResponse.split(/(\s+)/);
            for (const word of words) {
              controller.enqueue(encoder.encode(word));
              await new Promise((resolve) => setTimeout(resolve, 15));
            }

            await persistMessages(conversation.id, message, aiResponse);
            controller.close();
          } catch (err) {
            console.error('OpenAI Error:', err);
            const fallbackResponse = generateLocalMockResponse(
              message,
              breakdown,
              highestCategory.category,
              monthlyBudget,
              totalEmissions,
            );
            controller.enqueue(encoder.encode(fallbackResponse));
            await persistMessages(conversation.id, message, fallbackResponse);
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'x-conversation-id': conversation.id,
        },
      });
    }

    // Default Fallback Mock Response (word-by-word streaming generator)
    const mockResponse = generateLocalMockResponse(
      message,
      breakdown,
      highestCategory.category,
      monthlyBudget,
      totalEmissions,
    );
    const stream = new ReadableStream({
      async start(controller) {
        const words = mockResponse.split(/(\s+)/);
        for (const word of words) {
          controller.enqueue(encoder.encode(word));
          await new Promise((resolve) => setTimeout(resolve, 15));
        }
        await persistMessages(conversation.id, message, mockResponse);
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'x-conversation-id': conversation.id,
      },
    });
  } catch (error) {
    console.error('API Error: POST /api/copilot:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function persistMessages(
  conversationId: string,
  userMessage: string,
  assistantResponse: string,
) {
  await prisma.$transaction([
    prisma.conversationMessage.create({
      data: {
        conversationId,
        role: ConversationRole.USER,
        content: userMessage,
      },
    }),
    prisma.conversationMessage.create({
      data: {
        conversationId,
        role: ConversationRole.ASSISTANT,
        content: assistantResponse,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
}

export async function getCoachConversationResponse(req: Request) {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: 'conversationId query param is required' },
        { status: 400 },
      );
    }

    // Verify conversation ownership
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation || conversation.userId !== dbUser.id) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found or unauthorized' },
        { status: 404 },
      );
    }

    // Fetch conversation messages
    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('API Error: GET /api/copilot:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// Data-driven local advice generator
function generateLocalMockResponse(
  message: string,
  breakdown: Record<string, number>,
  highestCategory: string,
  budget: number,
  totalEmissions: number,
): string {
  const msgLower = message.toLowerCase();

  // Greeting
  if (msgLower.includes('hello') || msgLower.includes('hi') || msgLower.includes('hey')) {
    return `Hello! I am your Carbon Compass coach. I've analyzed your logs for this month. 
Currently, your highest source of emissions is **${highestCategory}** (${breakdown[highestCategory]?.toFixed(1) || 0} kg CO₂e).

How can I help you today? You can ask me for reduction tips or for a breakdown of your budget progress!`;
  }

  // Budget status
  if (msgLower.includes('budget') || msgLower.includes('target') || msgLower.includes('limit')) {
    const remaining = budget - totalEmissions;
    const percent = budget > 0 ? Math.round((totalEmissions / budget) * 100) : 0;
    let feedback = '';

    if (percent > 100) {
      feedback = `You have currently exceeded your monthly target limit by **${Math.abs(remaining).toFixed(1)} kg CO₂e**. Let's work together to look at ways to offset or trim shopping and food logs for the remaining weeks.`;
    } else if (percent > 80) {
      feedback = `You are approaching your limit, having utilized **${percent}%** of your target. You have **${remaining.toFixed(1)} kg CO₂e** remaining. Try adjusting your electricity usage or transport modes to stay safe!`;
    } else {
      feedback = `You are doing great! You have utilized only **${percent}%** of your target, leaving **${remaining.toFixed(1)} kg CO₂e** in your budget. Keep it up!`;
    }

    return `Here is your current budget status:
- **Monthly Budget Target**: ${budget.toFixed(0)} kg CO₂e
- **Logged Emissions**: ${totalEmissions.toFixed(1)} kg CO₂e
- **Remaining Balance**: ${remaining.toFixed(1)} kg CO₂e

${feedback}

Would you like some specific tips to lower your highest category: **${highestCategory}**?`;
  }

  // Transport Specific
  if (
    highestCategory === 'TRANSPORT' ||
    msgLower.includes('travel') ||
    msgLower.includes('transport') ||
    msgLower.includes('car')
  ) {
    return `Transport is your primary driver of emissions. Here are three simple and actionable tips to reduce it:
1. **Prefer Metro or Rail**: Opt for public metro networks or rail transit which cut emissions by up to 80% compared to solo car trips.
2. **Combine Commutes**: Plan weekly runs to group grocery and utility trips into a single transit loop.
3. **Try Carpooling**: Coordinate commute routes with colleagues to divide travel footprint by passenger count.`;
  }

  // Food Specific
  if (
    highestCategory === 'FOOD' ||
    msgLower.includes('food') ||
    msgLower.includes('meat') ||
    msgLower.includes('diet')
  ) {
    return `Food choices represent a major contribution this month. Here are three ways to optimize your food footprint:
1. **Try Meatless Mondays**: Replacing red meats or dairy with plant-based alternatives for just one day a week cuts food emissions by up to 15%.
2. **Shop Local & Seasonal**: Import and storage logistics increase footprint. Try shopping at local farmers' markets.
3. **Minimize Food Waste**: Decaying landfill food releases methane. Try batch-cooking meals to utilize ingredients completely.`;
  }

  // Energy Specific
  if (
    highestCategory === 'ENERGY' ||
    msgLower.includes('electricity') ||
    msgLower.includes('energy') ||
    msgLower.includes('power')
  ) {
    return `Electricity consumption drives your energy scores. Try these three tips to lower utility footprint:
1. **Optimize Aircon**: Keep cooling units at a standard 24°C (75°F); every degree higher saves roughly 6% power load.
2. **Unplug Standby Devices**: Chargers and electronics consume trickle power. Use smart power strips to shut down devices completely when not in use.
3. **Switch to LED Bulbs**: LED alternatives utilize up to 75% less energy and last longer than traditional incandescent lightbulbs.`;
  }

  // Default general advice
  return `I see you are interested in reducing your carbon footprint! Based on your current calendar month data, your highest category is **${highestCategory}**. 

Here are three simple and direct recommendations:
1. **Review ${highestCategory} habits**: Look at your recent logs to find recurring high-emission activities you can swap or reduce.
2. **Focus on high-yield logs**: Swapping a single long commute trip with transit or cooking plant-based meals yields immediate emission cuts.
3. **Manage your budget**: Keep monitoring your dashboard remaining meters to visualize your weekly progress against target targets.

What area would you like to discuss in detail? (e.g. transport, meal offsets, or electricity logs)`;
}
