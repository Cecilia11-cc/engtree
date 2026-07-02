'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface Treasure {
  treasure_id: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  content_type: string;
  content: string;
  tags: string;
  difficulty: string;
  target_exam: string;
  cover_image: string;
  author: string;
  view_count: number;
  like_count: number;
  is_featured: boolean;
  is_favorited: boolean;
  is_read: boolean;
  created_at: string;
}

const categoryConfig: Record<string, { label: string; icon: string; color: string }> = {
  grammar: { label: '语法宝典', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-teal-500/10 text-teal-600' },
  vocabulary: { label: '词汇金矿', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-amber-500/10 text-amber-600' },
  reading: { label: '阅读秘籍', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-blue-500/10 text-blue-600' },
  listening: { label: '听力宝盒', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'bg-rose-500/10 text-rose-600' },
  writing: { label: '写作锦囊', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'bg-purple-500/10 text-purple-600' },
  speaking: { label: '口语擂台', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'bg-green-500/10 text-green-600' },
  exam: { label: '考场宝典', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-red-500/10 text-red-600' },
  culture: { label: '文化殿堂', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064', color: 'bg-cyan-500/10 text-cyan-600' },
};

const contentTypeConfig: Record<string, { label: string; icon: string }> = {
  article: { label: '文章', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  video: { label: '视频', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  audio: { label: '音频', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
  pdf: { label: 'PDF', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  tips: { label: '技巧', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  exercise: { label: '练习', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-700' },
  easy: { label: '基础', color: 'bg-teal-100 text-teal-700' },
  medium: { label: '进阶', color: 'bg-amber-100 text-amber-700' },
  intermediate: { label: '中级', color: 'bg-amber-100 text-amber-700' },
  hard: { label: '挑战', color: 'bg-orange-100 text-orange-700' },
  advanced: { label: '高阶', color: 'bg-red-100 text-red-700' },
};

export default function TreasurePage() {
  const router = useRouter();
  const [treasures, setTreasures] = useState<Treasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeContentType, setActiveContentType] = useState<string>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const fetchTreasures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const token = session.access_token;

      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (activeContentType !== 'all') params.set('content_type', activeContentType);
      if (activeDifficulty !== 'all') params.set('difficulty', activeDifficulty);
      if (searchQuery) params.set('search', searchQuery);

      let res = await fetch(`/api/treasure?${params.toString()}`, {
        headers: { 'x-session': token },
      });

      // If 401, the token might be expired — try refreshing
      if (res.status === 401) {
        const { data: { session: newSession } } = await supabase.auth.refreshSession();
        if (newSession) {
          res = await fetch(`/api/treasure?${params.toString()}`, {
            headers: { 'x-session': newSession.access_token },
          });
        }
      }

      if (res.ok) {
        const data = await res.json();
        let items = data.data || [];
        setTotalCount(data.total || items.length);
        if (showFavorites) {
          items = items.filter((t: Treasure) => t.is_favorited);
        }
        setTreasures(items);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || `请求失败 (${res.status})`);
      }
    } catch (err) {
      console.error('获取资料失败:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [router, activeCategory, activeContentType, activeDifficulty, searchQuery, showFavorites]);

  useEffect(() => {
    fetchTreasures();
  }, [fetchTreasures]);

  const toggleFavorite = async (treasureId: string, currentFavorited: boolean) => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const token = session.access_token;

      const res = await fetch('/api/treasure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': token,
        },
        body: JSON.stringify({
          treasure_id: treasureId,
          action: currentFavorited ? 'unfavorite' : 'favorite',
        }),
      });

      if (res.ok) {
        setTreasures(prev =>
          prev.map(t =>
            t.treasure_id === treasureId
              ? { ...t, is_favorited: !currentFavorited, like_count: currentFavorited ? t.like_count - 1 : t.like_count + 1 }
              : t
          )
        );
        if (selectedTreasure?.treasure_id === treasureId) {
          setSelectedTreasure(prev => prev ? { ...prev, is_favorited: !currentFavorited } : null);
        }
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    }
  };

  const openDetail = async (treasure: Treasure) => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const token = session.access_token;

      const res = await fetch(`/api/treasure/${treasure.treasure_id}`, {
        headers: { 'x-session': token },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTreasure(data.data);
      }
    } catch {
      setSelectedTreasure(treasure);
    }
  };

  const categories = Object.entries(categoryConfig);
  const contentTypes = Object.entries(contentTypeConfig);
  const difficulties = Object.entries(difficultyConfig);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  // Detail modal
  if (selectedTreasure) {
    const catInfo = categoryConfig[selectedTreasure.category];
    const diffInfo = difficultyConfig[selectedTreasure.difficulty];
    const typeInfo = contentTypeConfig[selectedTreasure.content_type];
    const tags = selectedTreasure.tags ? selectedTreasure.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedTreasure(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          返回资料库
        </button>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {catInfo && (
                    <span className={`text-xs px-2 py-1 rounded-md ${catInfo.color}`}>{catInfo.label}</span>
                  )}
                  {diffInfo && (
                    <span className={`text-xs px-2 py-1 rounded-md ${diffInfo.color}`}>{diffInfo.label}</span>
                  )}
                  {typeInfo && (
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{typeInfo.label}</span>
                  )}
                </div>
                <h1 className="text-xl font-semibold text-foreground">{selectedTreasure.title}</h1>
                {selectedTreasure.description && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedTreasure.description}</p>
                )}
              </div>
              <button
                onClick={() => toggleFavorite(selectedTreasure.treasure_id, selectedTreasure.is_favorited)}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill={selectedTreasure.is_favorited ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  className={selectedTreasure.is_favorited ? 'text-amber-500' : 'text-muted-foreground'}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                {selectedTreasure.view_count} 次浏览
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                {selectedTreasure.like_count} 次收藏
              </span>
              <span>作者: {selectedTreasure.author || 'EngTree'}</span>
              {selectedTreasure.sub_category && <span>分类: {selectedTreasure.sub_category}</span>}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="px-6 py-3 border-b border-border flex items-center gap-2 flex-wrap">
              {tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-foreground">
              {selectedTreasure.content.split('\n').map((paragraph: string, idx: number) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={idx} className="text-lg font-semibold text-foreground mt-6 mb-3">{paragraph.replace('## ', '')}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={idx} className="text-base font-medium text-foreground mt-4 mb-2">{paragraph.replace('### ', '')}</h3>;
                }
                if (paragraph.startsWith('- ')) {
                  return <li key={idx} className="text-sm text-foreground/80 ml-4">{paragraph.replace('- ', '')}</li>;
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote key={idx} className="border-l-4 border-primary/30 pl-4 my-3 text-sm text-foreground/70 italic">
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (paragraph.trim() === '') return <br key={idx} />;
                return <p key={idx} className="text-sm text-foreground/80 leading-relaxed mb-2">{paragraph}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
            英语树藏宝阁
          </h1>
          <p className="text-sm text-muted-foreground mt-1">精选英语学习资料，从语法到文化，一站式获取 · 共 {totalCount} 份</p>
        </div>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm ${
            showFavorites
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/20'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={showFavorites ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
          {showFavorites ? '我的收藏' : '全部资料'}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          type="text"
          placeholder="搜索资料、标签、关键词..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
        />
      </div>

      {/* Category Filter */}
      <div>
        <div className="text-xs text-muted-foreground mb-2 font-medium">分类</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            全部
          </button>
          {categories.map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeCategory === key
                  ? 'bg-primary text-primary-foreground'
                  : `${config.color} hover:opacity-80`
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type & Difficulty */}
      <div className="flex flex-wrap gap-6">
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-medium">类型</div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveContentType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeContentType === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              全部
            </button>
            {contentTypes.map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveContentType(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeContentType === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-medium">难度</div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDifficulty('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeDifficulty === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              全部
            </button>
            {difficulties.map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveDifficulty(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeDifficulty === key
                    ? 'bg-primary text-primary-foreground'
                    : `${config.color} hover:opacity-80`
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Treasures Grid */}
      {error ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-destructive/50 mb-4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <p className="text-destructive text-sm mb-2">{error}</p>
          <button onClick={() => fetchTreasures()} className="text-primary text-sm underline underline-offset-4 hover:text-primary/80">点击重试</button>
        </div>
      ) : treasures.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground/30 mb-4"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
          <p className="text-muted-foreground text-sm">
            {showFavorites ? '还没有收藏资料，快去发现宝藏吧' : '暂无匹配的资料'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {treasures.map((treasure) => {
            const catInfo = categoryConfig[treasure.category];
            const diffInfo = difficultyConfig[treasure.difficulty];
            const typeInfo = contentTypeConfig[treasure.content_type];
            const tags = treasure.tags ? treasure.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

            return (
              <div
                key={treasure.treasure_id}
                className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onClick={() => openDetail(treasure)}
              >
                {/* Card Header with category accent */}
                <div className={`h-1.5 ${treasure.category === 'grammar' ? 'bg-teal-500' : treasure.category === 'vocabulary' ? 'bg-amber-500' : treasure.category === 'reading' ? 'bg-blue-500' : treasure.category === 'listening' ? 'bg-rose-500' : treasure.category === 'writing' ? 'bg-purple-500' : treasure.category === 'speaking' ? 'bg-green-500' : treasure.category === 'exam' ? 'bg-red-500' : 'bg-cyan-500'}`} />

                <div className="p-4">
                  {/* Category & badges */}
                  <div className="flex items-center gap-2 mb-3">
                    {catInfo && (
                      <span className={`text-xs px-2 py-0.5 rounded-md ${catInfo.color}`}>{catInfo.label}</span>
                    )}
                    {diffInfo && (
                      <span className={`text-xs px-2 py-0.5 rounded-md ${diffInfo.color}`}>{diffInfo.label}</span>
                    )}
                    {typeInfo && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{typeInfo.label}</span>
                    )}
                    {treasure.is_featured && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 flex items-center gap-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        精选
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm line-clamp-2 mb-2">
                    {treasure.title}
                  </h3>

                  {/* Description */}
                  {treasure.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {treasure.description}
                    </p>
                  )}

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-primary/5 text-primary/70">
                          #{tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        {treasure.view_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                        {treasure.like_count}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(treasure.treasure_id, treasure.is_favorited);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={treasure.is_favorited ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="2"
                        className={treasure.is_favorited ? 'text-amber-500' : 'text-muted-foreground'}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
