'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const scenarios = [
  { id: 'airport', label: '机场值机与海关', desc: '练习机场登机、海关通关英语对话', icon: '✈️' },
  { id: 'academic', label: '学术会议交流', desc: '模拟学术研讨、论文答辩场景', icon: '🎓' },
  { id: 'housing', label: '租房与物业沟通', desc: '练习租房、物业维修等日常沟通', icon: '🏠' },
  { id: 'library', label: '图书馆借阅咨询', desc: '模拟图书馆咨询、借书场景', icon: '📖' },
  { id: 'interview', label: '求职面试准备', desc: '模拟英文面试、自我介绍场景', icon: '💼' },
];

export default function SpeakingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initSession = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) { router.replace('/login'); return; }
      setSession(s);
    } catch {
      // Ignore
    }
  }, [router]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const scenario = scenarios.find((s) => s.id === scenarioId);
    setMessages([
      {
        role: 'assistant',
        content: `Welcome! I'll be your conversation partner for the "${scenario?.label}" scenario. Let's start - please introduce yourself and tell me why you're here today.`,
      },
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim() || !session || !selectedScenario) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': session.access_token,
        },
        body: JSON.stringify({
          scenario: selectedScenario,
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          setMessages((prev) => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'assistant', content: assistantContent };
            return newMsgs;
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedScenario) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-1">听说训练</h1>
        <p className="text-sm text-muted-foreground mb-6">选择一个场景，开始 AI 英语对话练习</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => startScenario(scenario.id)}
              className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="text-3xl mb-3">{scenario.icon}</div>
              <h3 className="font-medium text-foreground mb-1">{scenario.label}</h3>
              <p className="text-sm text-muted-foreground">{scenario.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-foreground">
            {scenarios.find((s) => s.id === selectedScenario)?.label}
          </h1>
          <p className="text-xs text-muted-foreground">AI 英语对话练习</p>
        </div>
        <button
          type="button"
          onClick={() => { setSelectedScenario(null); setMessages([]); }}
          className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          换个场景
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3 text-sm text-muted-foreground">
              思考中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-border">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your response in English..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={loading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
