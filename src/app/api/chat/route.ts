import { NextResponse } from 'next/server';

export const runtime = 'edge';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// Simple in-memory rate limiting (per IP would be better, but this is a start)
// For a real production app, use Redis or a similar store.
const lastRequestTime = new Map<string, number>();
const RATE_LIMIT_MS = 2000; // 2 seconds between messages

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Basic anti-abuse: check if messages exist and aren't too long
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Mensajes no válidos' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.content.length > 500) {
      return NextResponse.json({ error: 'El mensaje es demasiado largo' }, { status: 400 });
    }

    // Rate limiting check
    const now = Date.now();
    const clientIp = req.headers.get('x-forwarded-for') || 'anonymous';
    const lastRequest = lastRequestTime.get(clientIp);

    if (lastRequest && now - lastRequest < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Por favor, espera un momento antes de enviar otro mensaje.' },
        { status: 429 }
      );
    }
    lastRequestTime.set(clientIp, now);

    const systemPrompt = "Eres el asistente oficial de Inmortal RP, un servidor de FiveM. Debes ayudar a los usuarios con dudas sobre el servidor, soporte básico, comandos, whitelist, normas, trabajos, facciones, sistemas y ayuda general. Responde siempre de manera amigable, clara y profesional. Mantén respuestas cortas y útiles.";

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API Error:', errorData);
      return NextResponse.json(
        { error: 'Error al comunicarse con el servicio de IA. Inténtalo de nuevo más tarde.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado en el servidor.' },
      { status: 500 }
    );
  }
}
