'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, MessageSquare, Send, User, X } from 'lucide-react';

import { companyConfig } from '@/lib/site-config';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type UiLanguage = 'en' | 'es';

const STORAGE_KEY = 'usa-pools-assistant-history';
const INITIAL_MESSAGES: Message[] = [
  {
    role: 'assistant',
    content: `Hello, welcome to ${companyConfig.shortName}. How can I help you today?`,
  },
];

function detectLanguage(text: string): UiLanguage {
  const normalized = text.toLowerCase();
  const spanishPattern =
    /[¿¡áéíóúñ]|\b(hola|gracias|precio|cotizacion|cotización|piscina|mantenimiento|reparacion|reparación|servicio|quiero|necesito|pueden|cuanto|cuánto)\b/;

  return spanishPattern.test(normalized) ? 'es' : 'en';
}

function getCopy(language: UiLanguage) {
  if (language === 'es') {
    return {
      statusOnline: 'En linea',
      statusOffline: 'Desconectado',
      subtitle: 'Soporte de piscinas y servicios',
      placeholder: 'Escribe tu mensaje...',
      typing: 'USA Pools Assistant esta escribiendo...',
      offlineReply:
        'Ahora mismo estoy offline. Revisa tu conexion e intentalo de nuevo en un momento.',
      fallbackReply:
        'No pude responder ahora mismo. Intentalo otra vez en un momento o escribenos por WhatsApp para ayuda mas rapida.',
    };
  }

  return {
    statusOnline: 'Online',
    statusOffline: 'Offline',
    subtitle: 'Pool construction and service support',
    placeholder: 'Write your message...',
    typing: 'USA Pools Assistant is typing...',
    offlineReply:
      'I am offline right now. Please check your connection and try again in a moment.',
    fallbackReply:
      'I could not answer right now. Please try again in a moment or contact us by WhatsApp for faster help.',
  };
}

export default function InmortalAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide assistant on admin pages
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  useEffect(() => {
    const storedMessages = window.sessionStorage.getItem(STORAGE_KEY);
    if (!storedMessages) {
      return;
    }

    try {
      const parsedMessages = JSON.parse(storedMessages) as Message[];
      if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Could not restore assistant history:', error);
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(window.navigator.onLine);

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  async function handleSend() {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue || isLoading) {
      return;
    }

    const nextLanguage = detectLanguage(trimmedValue);
    const copy = getCopy(nextLanguage);
    const userMessage: Message = { role: 'user', content: trimmedValue };
    const updatedMessages = [...messages, userMessage];

    setUiLanguage(nextLanguage);
    setMessages(updatedMessages);
    setInputValue('');

    if (!isOnline) {
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: copy.offlineReply },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();
      const assistantContent = data?.choices?.[0]?.message?.content?.trim();

      if (!response.ok || !assistantContent) {
        throw new Error(data?.error || 'Assistant request failed.');
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: assistantContent },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: copy.fallbackReply },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  const copy = getCopy(uiLanguage);

  return (
    <div className="fixed bottom-5 left-5 z-50 md:bottom-8 md:left-8">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="relative flex h-16 w-16 items-center justify-center rounded-full border border-sky-400/20 bg-slate-950/90 text-white shadow-[0_24px_70px_rgba(15,23,42,0.6)] backdrop-blur"
        aria-label="Open assistant chat"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        {!isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-20 left-0 flex h-[min(72vh,38rem)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-[0_28px_90px_rgba(2,6,23,0.7)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/90 p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sky-300">
                  <Bot size={22} />
                  <span
                    className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">USA Pools Assistant</h3>
                  <p className="text-xs text-slate-300">
                    {isOnline ? copy.statusOnline : copy.statusOffline} • {copy.subtitle}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close assistant chat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, x: message.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[88%] gap-2 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        message.role === 'user'
                          ? 'bg-sky-500 text-white'
                          : 'border border-white/10 bg-slate-900 text-sky-300'
                      }`}
                    >
                      {message.role === 'user' ? <User size={15} /> : <Bot size={15} />}
                    </div>

                    <div
                      className={`rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'rounded-tr-none bg-sky-500 text-white'
                          : 'rounded-tl-none border border-white/10 bg-slate-900 text-slate-100'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex max-w-[88%] gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-sky-300">
                      <Bot size={15} />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-white/10 bg-slate-900 p-3 text-xs italic text-slate-300">
                      <Loader2 size={15} className="animate-spin text-sky-300" />
                      <span>{copy.typing}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-slate-950 p-4">
              <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-slate-900 p-2 focus-within:border-sky-400/50">
                <textarea
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={copy.placeholder}
                  className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                  rows={1}
                />

                <button
                  onClick={() => void handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  className="rounded-xl p-3 text-sky-300 transition hover:bg-sky-400/10 hover:text-sky-200 disabled:cursor-not-allowed disabled:text-slate-600"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>

              <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {companyConfig.name}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
