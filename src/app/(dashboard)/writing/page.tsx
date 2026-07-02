'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface EssayScore {
  grammar: number;
  vocabulary: number;
  structure: number;
  naturalness: number;
  overall: number;
  suggestions: string;
  corrected: string;
}

export default function WritingPage() {
  const router = useRouter();
  const [essay, setEssay] = useState('');
  const [topic, setTopic] = useState('');
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState<EssayScore | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async () => {
    if (!essay.trim() || !session) return;
    setScoring(true);
    setResult(null);
    setStreamingText('');

    try {
      const res = await fetch('/api/ai/essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': session.access_token,
        },
        body: JSON.stringify({ essay, topic: topic || 'General English Essay' }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScoring(false);
    }
  };

  const scoreDimensions = result
    ? [
        { label: '语法', value: result.grammar, color: 'bg-blue-500' },
        { label: '词汇', value: result.vocabulary, color: 'bg-amber-500' },
        { label: '结构', value: result.structure, color: 'bg-teal-500' },
        { label: '表达', value: result.naturalness, color: 'bg-purple-500' },
      ]
    : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-1">作文批改</h1>
      <p className="text-sm text-muted-foreground mb-6">AI 四维评分，提供修改建议和高分范文</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">题目 (可选)</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Impact of Technology on Education"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">你的作文</label>
            <textarea
              ref={textareaRef}
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder="Write your essay here..."
              rows={12}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-muted-foreground">{essay.split(/\s+/).filter(Boolean).length} words</span>
              <button
                type="button"
                onClick={() => { setEssay(''); setResult(null); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                清空
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={scoring || !essay.trim()}
            className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scoring ? '批改中...' : '提交批改'}
          </button>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {scoring && !result && (
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <div className="animate-pulse text-4xl mb-3">📝</div>
              <p className="text-foreground font-medium">AI 正在批改中</p>
              <p className="text-sm text-muted-foreground mt-1">从语法、词汇、结构、表达四个维度评分</p>
            </div>
          )}

          {result && (
            <>
              {/* Score Overview */}
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">综合评分</h3>
                  <span className="text-3xl font-bold text-primary">{result.overall}</span>
                </div>
                <div className="space-y-3">
                  {scoreDimensions.map((dim) => (
                    <div key={dim.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{dim.label}</span>
                        <span className="text-muted-foreground">{dim.value}/100</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${dim.color} transition-all duration-500`}
                          style={{ width: `${dim.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-medium text-foreground mb-3">修改建议</h3>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {result.suggestions}
                </div>
              </div>

              {/* Corrected Version */}
              {result.corrected && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-medium text-foreground mb-3">高分范文</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {result.corrected}
                  </div>
                </div>
              )}
            </>
          )}

          {!scoring && !result && (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <div className="text-4xl mb-3">✍️</div>
              <p className="text-foreground font-medium">在左侧输入作文</p>
              <p className="text-sm text-muted-foreground mt-1">AI 将从四个维度给出评分和建议</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
