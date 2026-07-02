import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-session');
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const client = getSupabaseClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'learn';

    // Get user profile to determine word category
    const { data: profile } = await client
      .from('app_user')
      .select('major, target')
      .eq('user_id', user.id)
      .maybeSingle();

    // Determine category based on major
    let category = 'core';
    if (profile?.major) {
      const majorLower = profile.major.toLowerCase();
      if (majorLower.includes('计算机') || majorLower.includes('软件') || majorLower.includes('信息')) {
        category = 'cs';
      } else if (majorLower.includes('商务') || majorLower.includes('经济') || majorLower.includes('管理')) {
        category = 'business';
      }
    }

    if (mode === 'review') {
      // Get words that need review (next_review_at <= now and mastery < 5)
      const { data: reviewWords, error } = await client
        .from('user_word')
        .select('id, word_id, mastery, review_count, next_review_at, word:word_id(word_id, word_text, phonetic, meaning, example_sentence, example_translation, category)')
        .eq('user_id', user.id)
        .lt('mastery', 5)
        .lte('next_review_at', new Date().toISOString())
        .limit(30);

      if (error) throw new Error(`查询复习单词失败: ${error.message}`);

      const mapped = (reviewWords || []).map((uw: Record<string, unknown>) => {
        const w = uw.word as Record<string, unknown>;
        return {
          word_id: w?.word_id,
          word: w?.word_text,
          phonetic: w?.phonetic || '',
          meaning: w?.meaning,
          example: w?.example_sentence || '',
          example_translation: w?.example_translation || '',
          category: w?.category || 'core',
          mastery: uw.mastery,
          next_review: uw.next_review_at,
        };
      });

      return NextResponse.json({ data: mapped });
    }

    // Learn mode: get words not yet in user_word, prefer category match
    const { data: existingUserWords } = await client
      .from('user_word')
      .select('word_id')
      .eq('user_id', user.id);

    const existingIds = (existingUserWords || []).map((uw: Record<string, unknown>) => uw.word_id);

    const { data: allWords, error } = await client
      .from('word')
      .select('*')
      .order('word_text')
      .limit(100);

    if (error) throw new Error(`查询单词失败: ${error.message}`);

    // Filter out existing and prefer category
    let newWords = (allWords || []).filter((w: Record<string, unknown>) => !existingIds.includes(w.word_id));

    // Prefer category match first
    const categoryWords = newWords.filter((w: Record<string, unknown>) => w.category === category);
    const otherWords = newWords.filter((w: Record<string, unknown>) => w.category !== category);
    newWords = [...categoryWords, ...otherWords].slice(0, 20);

    const mapped = newWords.map((w: Record<string, unknown>) => ({
      word_id: w.word_id,
      word: w.word_text,
      phonetic: w.phonetic || '',
      meaning: w.meaning,
      example: w.example_sentence || '',
      example_translation: w.example_translation || '',
      category: w.category || 'core',
      mastery: 0,
      next_review: '',
    }));

    return NextResponse.json({ data: mapped });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('x-session');
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const client = getSupabaseClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    const body = await request.json();
    const { word_id, knew } = body;

    // Get current user_word record
    const { data: existing } = await client
      .from('user_word')
      .select('*')
      .eq('user_id', user.id)
      .eq('word_id', word_id)
      .maybeSingle();

    const currentMastery = (existing as Record<string, unknown>)?.mastery as number || 0;
    const currentReviewCount = (existing as Record<string, unknown>)?.review_count as number || 0;

    // Ebbinghaus intervals (in hours): 0.5, 1, 2, 4, 8, 24, 48, 168
    const intervals = [0.5, 1, 2, 4, 8, 24, 48, 168];

    let newMastery: number;
    let nextReviewAt: string;

    if (knew) {
      newMastery = Math.min(currentMastery + 1, 5);
      const nextInterval = intervals[Math.min(currentReviewCount, intervals.length - 1)];
      nextReviewAt = new Date(Date.now() + nextInterval * 3600 * 1000).toISOString();
    } else {
      newMastery = Math.max(currentMastery - 1, 0);
      nextReviewAt = new Date(Date.now() + 0.5 * 3600 * 1000).toISOString(); // 30 min
    }

    if (existing) {
      const { data, error } = await client
        .from('user_word')
        .update({
          mastery: newMastery,
          review_count: currentReviewCount + 1,
          next_review_at: nextReviewAt,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('word_id', word_id)
        .select()
        .single();

      if (error) throw new Error(`更新单词学习记录失败: ${error.message}`);
      return NextResponse.json({ data });
    } else {
      // Create new user_word record
      const { data, error } = await client
        .from('user_word')
        .insert({
          user_id: user.id,
          word_id,
          mastery: newMastery,
          review_count: 1,
          next_review_at: nextReviewAt,
        })
        .select()
        .single();

      if (error) throw new Error(`创建单词学习记录失败: ${error.message}`);
      return NextResponse.json({ data });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
