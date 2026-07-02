'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface ErrorItem {
  error_id: string;
  user_id: string;
  error_type: string;
  content: string;
  correct_answer: string;
  source: string;
  created_at: string;
  review_count: number;
  mastered: boolean;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  grammar: { label: '语法', color: 'bg-blue-500/10 text-blue-600' },
  vocabulary: { label: '词汇', color: 'bg-amber-500/10 text-amber-600' },
  reading: { label: '阅读', color: 'bg-teal-500/10 text-teal-600' },
  listening: { label: '听力', color: 'bg-purple-500/10 text-purple-600' },
  writing: { label: '写作', color: 'bg-rose-500/10 text-rose-600' },
};

export default function ErrorsPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchErrors = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }

      const res = await fetch('/api/errors', { headers: { 'x-session': session.access_token } });
      if (res.ok) {
        const data = await res.json();
        setErrors(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  const markMastered = async (errorId: string) => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/errors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-session': session.access_token },
        body: JSON.stringify({ error_id: errorId, mastered: true }),
      });

      if (res.ok) {
        setErrors(errors.map((e) => e.error_id === errorId ? { ...e, mastered: true } : e));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredErrors = filter === 'all' ? errors : errors.filter((e) => e.error_type === filter);
  const unmastered = filteredErrors.filter((e) => !e.mastered);
  const mastered = filteredErrors.filter((e) => e.mastered);

  // Stats
  const stats = errors.reduce((acc, e) => {
    const type = e.error_type;
    if (!acc[type]) acc[type] = { total: 0, mastered: 0 };
    acc[type].total++;
    if (e.mastered) acc[type].mastered++;
    return acc;
  }, {} as Record<string, { total: number; mastered: number }>);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-1">错题本</h1>
      <p className="text-sm text-muted-foreground mb-6">自动收集薄弱项，智能强化训练</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(typeLabels).map(([key, info]) => {
          const stat = stats[key] || { total: 0, mastered: 0 };
          return (
            <div key={key} className="bg-card rounded-xl border border-border p-4">
              <span className={`text-xs px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
              <div className="mt-2 text-lg font-semibold text-foreground">{stat.total}</div>
              <div className="text-xs text-muted-foreground">已掌握 {stat.mastered}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          全部
        </button>
        {Object.entries(typeLabels).map(([key, info]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {info.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <div className="space-y-6">
          {/* Unmastered */}
          {unmastered.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">待复习 ({unmastered.length})</h2>
              <div className="space-y-3">
                {unmastered.map((item) => {
                  const info = typeLabels[item.error_type] || typeLabels.grammar;
                  const isExpanded = expandedId === item.error_id;
                  return (
                    <div key={item.error_id} className="bg-card rounded-xl border border-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : item.error_id)}
                        className="w-full flex items-center gap-3 p-4 text-left"
                      >
                        <span className={`text-xs px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
                        <span className="flex-1 text-sm text-foreground truncate">{item.content}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2">
                          <div className="bg-destructive/5 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">你的答案</div>
                            <div className="text-sm text-foreground">{item.content}</div>
                          </div>
                          <div className="bg-primary/5 rounded-lg p-3">
                            <div className="text-xs text-muted-foreground mb-1">正确答案</div>
                            <div className="text-sm text-foreground">{item.correct_answer}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            来源：{item.source} | 复习 {item.review_count} 次
                          </div>
                          <button
                            type="button"
                            onClick={() => markMastered(item.error_id)}
                            className="text-xs text-primary hover:underline"
                          >
                            标记为已掌握
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mastered */}
          {mastered.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">已掌握 ({mastered.length})</h2>
              <div className="space-y-2">
                {mastered.map((item) => {
                  const info = typeLabels[item.error_type] || typeLabels.grammar;
                  return (
                    <div key={item.error_id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border opacity-60">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${info.color}`}>{info.label}</span>
                      <span className="flex-1 text-sm text-foreground line-through truncate">{item.content}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredErrors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无错题</p>
              <p className="text-sm text-muted-foreground mt-1">学习过程中的错误会自动收录到这里</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
