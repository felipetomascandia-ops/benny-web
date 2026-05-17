import { NextResponse } from 'next/server';

export const runtime = 'edge';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const SYSTEM_PROMPT =
  "You are the official virtual assistant for USA Pools Services LLC, a Pennsylvania pool company. Help visitors with questions about custom pool construction, pool remodeling, maintenance programs, repairs, outdoor upgrades, estimates, booking a site visit, service area, and general contact guidance. Reply in the same language as the user's latest message. If the language is unclear, default to English. Keep responses friendly, professional, short, and useful. Do not mention Inmortal RP, FiveM, gaming, or unrelated businesses. If a visitor asks for pricing or a project-specific quote, invite them to request a quote or book a site visit.";

// Simple in-memory rate limiting (per IP would be better, but this is a start)
// For a real production app, use Redis or a similar store.
const lastRequestTime = new Map<string, number>();
const RATE_LIMIT_MS = 2000; // 2 seconds between messages

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Basic anti-abuse: check if messages exist and aren't too long
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid message payload.' }, { status: 400 });
    }

    const sanitizedMessages = messages
      .filter(
        (message: { role?: string; content?: string }) =>
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string' &&
          message.content.trim().length > 0
      )
      .slice(-12);

    if (sanitizedMessages.length === 0) {
      return NextResponse.json({ error: 'Invalid message payload.' }, { status: 400 });
    }

    const lastMessage = sanitizedMessages[sanitizedMessages.length - 1];
    if (lastMessage.content.length > 500) {
      return NextResponse.json({ error: 'Message is too long.' }, { status: 400 });
    }

    // Rate limiting check
    const now = Date.now();
    const clientIp = req.headers.get('x-forwarded-for') || 'anonymous';
    const lastRequest = lastRequestTime.get(clientIp);

    if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Please wait a moment before sending another message.' },
        { status: 429 }
      );
    }
    lastRequestTime.set(clientIp, now);

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...sanitizedMessages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return NextResponse.json(
        { error: 'The assistant is temporarily unavailable. Please try again in a moment.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 }
    );
  }
}
