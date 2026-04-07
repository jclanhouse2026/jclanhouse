import React, { useState, useRef, useEffect } from 'react';
import { gerarTextoIA } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import XCircleIcon from './icons/XCircleIcon';
import SendIcon from './icons/SendIcon';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Olá! Sou seu assistente inteligente. Como posso ajudar com seus serviços de Lan House, Gráfica ou Currículo hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await gerarTextoIA(
        userMessage,
        "Você é um assistente prestativo da JC Lan House e Gráfica. Você ajuda clientes com dúvidas sobre currículos, impressões, convites, temas de cadernos e serviços gerais de Lan House. Seja cordial, profissional e direto."
      );
      setMessages(prev => [...prev, { role: 'ai', text: response || "Desculpe, não consegui processar sua solicitação." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Ocorreu um erro ao falar com a IA. Verifique sua conexão." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-cyan-600 text-white p-4 rounded-full shadow-2xl hover:bg-cyan-700 transition-all hover:scale-110 flex items-center justify-center group"
          title="Assistente IA"
        >
          <SparklesIcon className="w-6 h-6 group-hover:animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap font-bold">Assistente IA</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-[350px] sm:w-[400px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="bg-cyan-600 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-white" />
              <span className="font-bold text-white">Assistente JC IA</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-900/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : 'bg-slate-700 text-slate-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700 bg-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Como posso ajudar?"
                className="flex-grow bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-cyan-600 text-white p-2 rounded-xl hover:bg-cyan-700 disabled:opacity-50 transition-colors"
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
