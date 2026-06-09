'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiX, FiInfo } from 'react-icons/fi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MacraChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya MacraAI. Ada yang bisa saya bantu hari ini mengenai kesehatan, gizi, atau aktivitas olahraga Anda? 🍏' }
  ]);
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMessage];
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', messages: history })
      });
      const data = await res.json();
      if (data.success && data.choices?.[0]?.message) {
        setMessages(prev => [...prev, data.choices[0].message]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, saya tidak bisa memproses permintaan saat ini.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Koneksi terputus. Silakan coba lagi.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-bg flex items-center justify-center shadow-lg hover:shadow-primary/25 cursor-pointer transition-all duration-200 transform hover:scale-105 active:scale-95"
        title="Tanya MacraAI"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[90] w-[360px] max-w-[calc(100vw-32px)] h-[480px] bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          <div className="p-4 bg-primary-light/5 border-b border-border-light flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-sm font-semibold">
                🪄
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-primary leading-none flex items-center gap-1.5">
                  MacraAI
                  <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse" />
                </h4>
                <p className="text-[10px] text-text-secondary mt-0.5">Asisten Kesehatan MacraAI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary cursor-pointer transition-colors bg-transparent border-none"
            >
              <FiX size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary/10 text-text-primary self-end border border-primary/20 rounded-tr-none'
                    : 'bg-surface-2 text-text-primary self-start border border-border-light rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="bg-surface-2 text-text-primary self-start border border-border-light rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-surface-2 border-t border-border-light flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-[13px] outline-none focus:border-primary placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-lg bg-primary hover:bg-primary-hover text-bg flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <FiSend size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
