'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface Word {
  word_id: string;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  example_translation: string;
  category: string;
  mastery: number; // 0-5, Ebbinghaus levels
  next_review: string;
}

const categoryNames: Record<string, string> = {
  core: '核心词汇',
  cs: '计算机',
  business: '商务',
  daily: '日常',
  exam: '考试',
};

export default function WordsPage() {
  const router = useRouter();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<'learn' | 'review'>('learn');
  const [session, setSession] = useState<{ access_token: string } | null>(null);

  const fetchWords = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) { router.replace('/login'); return; }
      setSession(s);

      const res = await fetch(`/api/words?mode=${mode}`, { headers: { 'x-session': s.access_token } });
      if (res.ok) {
        const data = await res.json();
        setWords(data.data || []);
        setCurrentIndex(0);
        setFlipped(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router, mode]);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const updateMastery = async (wordId: string, knew: boolean) => {
    if (!session) return;
    try {
      await fetch('/api/words', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-session': session.access_token },
        body: JSON.stringify({ word_id: wordId, knew }),
      });
    } catch (err) {
      console.error(err);
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    } else {
      // Session complete
      setWords([]);
    }
  };

  const currentWord = words[currentIndex];

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-1">单词计划</h1>
      <p className="text-sm text-muted-foreground mb-6">基于艾宾浩斯遗忘曲线的智能背词</p>

      {/* Mode Switch */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode('learn')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            mode === 'learn' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          学习新词
        </button>
        <button
          type="button"
          onClick={() => setMode('review')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            mode === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          复习错词
        </button>
      </div>

      {words.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-foreground font-medium">
            {mode === 'learn' ? '今日单词已学完' : '暂无需要复习的单词'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'learn' ? '明天继续加油' : '所有单词已掌握'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">{currentIndex + 1}/{words.length}</span>
          </div>

          {/* Word Card */}
          {currentWord && (
            <div
              className="bg-card rounded-2xl border border-border p-8 min-h-[320px] flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md"
              onClick={() => setFlipped(!flipped)}
            >
              <div className="mb-2">
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {categoryNames[currentWord.category] || currentWord.category}
                </span>
              </div>

              {!flipped ? (
                <>
                  <h2 className="text-4xl font-semibold text-foreground mb-2">{currentWord.word}</h2>
                  <p className="text-sm text-muted-foreground">{currentWord.phonetic}</p>
                  <p className="text-sm text-muted-foreground mt-6">点击翻转查看释义</p>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-semibold text-foreground mb-2">{currentWord.word}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{currentWord.phonetic}</p>
                  <p className="text-xl text-foreground mb-4">{currentWord.meaning}</p>
                  <div className="bg-muted/50 rounded-lg p-4 w-full max-w-md">
                    <p className="text-sm text-foreground italic">{currentWord.example}</p>
                    <p className="text-xs text-muted-foreground mt-1">{currentWord.example_translation}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {flipped && currentWord && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => updateMastery(currentWord.word_id, false)}
                className="flex-1 py-3 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all text-sm font-medium"
              >
                不认识
              </button>
              <button
                type="button"
                onClick={() => updateMastery(currentWord.word_id, true)}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium"
              >
                认识
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
