import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/treasure - 获取资料列表
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-session');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const client = getSupabaseClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      console.error('[treasure API] Auth failed:', authError?.message || 'no user');
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const contentType = searchParams.get('content_type');
    const difficulty = searchParams.get('difficulty');
    const targetExam = searchParams.get('target_exam');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = client
      .from('treasure')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (contentType) query = query.eq('content_type', contentType);
    if (difficulty) query = query.eq('difficulty', difficulty);
    if (targetExam) query = query.eq('target_exam', targetExam);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log('[treasure API] Fetched', (data || []).length, 'items');

    // 获取用户的收藏状态
    const { data: userFavorites } = await client
      .from('user_treasure')
      .select('treasure_id, is_favorite, is_read')
      .eq('user_id', user.id);

    const favoriteMap = new Map(
      (userFavorites || []).map((uf: { treasure_id: string; is_favorite: boolean; is_read: boolean }) => [uf.treasure_id, uf])
    );

    const treasures = (data || []).map((t: Record<string, unknown>) => ({
      ...t,
      is_favorited: favoriteMap.get(String(t.treasure_id))?.is_favorite || false,
      is_read: favoriteMap.get(String(t.treasure_id))?.is_read || false,
    }));

    return NextResponse.json({ data: treasures, total: treasures.length });
  } catch (err) {
    console.error('获取资料失败:', err);
    return NextResponse.json({ error: '获取资料失败' }, { status: 500 });
  }
}

// POST /api/treasure - 收藏/取消收藏资料
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-session');
    if (!token) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const client = getSupabaseClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { treasure_id, action } = body; // action: 'favorite', 'unfavorite', 'mark_read'

    if (!treasure_id || !action) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (action === 'favorite') {
      const { error } = await client
        .from('user_treasure')
        .upsert({
          user_id: user.id,
          treasure_id,
          is_favorite: true,
        }, { onConflict: 'user_id,treasure_id' });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'favorited' });
    }

    if (action === 'unfavorite') {
      await client
        .from('user_treasure')
        .delete()
        .eq('user_id', user.id)
        .eq('treasure_id', treasure_id);
      return NextResponse.json({ success: true, action: 'unfavorited' });
    }

    if (action === 'mark_read') {
      const { error } = await client
        .from('user_treasure')
        .upsert({
          user_id: user.id,
          treasure_id,
          is_read: true,
        }, { onConflict: 'user_id,treasure_id' });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'marked_read' });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (err) {
    console.error('操作资料失败:', err);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
