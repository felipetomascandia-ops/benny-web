'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const InmortalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al conectar con el asistente');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Lo siento, hubo un problema técnico. Por favor, intenta de nuevo más tarde.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-2xl flex items-center justify-center border-2 border-purple-400/30 backdrop-blur-sm"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
          </span>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] max-h-[600px] h-[80vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <Bot className="text-purple-300" size={24} />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${isOnline ? 'bg-green-500' : 'bg-zinc-500'}`}></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg leading-tight">Inmortal Assistant</h3>
                  <p className="text-purple-300/80 text-xs flex items-center gap-1">
                    {isOnline ? 'En línea' : 'Desconectado'} • Soporte Inmortal RP
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.length === 0 && (
                <div className="text-center py-10 px-6">
                  <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700/50 mb-4 inline-block">
                    <Bot size={40} className="text-purple-400 mx-auto" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">¡Hola Ciudadano!</h4>
                  <p className="text-zinc-400 text-sm">
                    Soy el asistente virtual de Inmortal RP. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre comandos, normas o cómo unirte.
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-purple-600' : 'bg-zinc-800 border border-zinc-700'}`}>
                      {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-purple-400" />}
                    </div>
                    <div
                      className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
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
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                      <Bot size={16} className="text-purple-400" />
                    </div>
                    <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <Loader2 size={16} className="text-purple-400 animate-spin" />
                      <span className="text-zinc-400 text-xs italic">Inmortal Assistant está escribiendo...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <div className="relative flex items-center gap-2 bg-zinc-800 rounded-xl p-2 border border-zinc-700 focus-within:border-purple-500 transition-colors">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent text-white text-sm outline-none resize-none py-1 px-2 max-h-32 min-h-[40px]"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all ${
                    !inputValue.trim() || isLoading
                      ? 'text-zinc-600 cursor-not-allowed'
                      : 'text-purple-400 hover:bg-purple-400/10 hover:text-purple-300'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-[10px] text-center text-zinc-500 mt-2">
                Impulsado por Groq AI • Inmortal RP 2026
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InmortalAssistant;
