import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/treasure/[id] - 获取资料详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { data, error } = await client
      .from('treasure')
      .select('*')
      .eq('treasure_id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '资料不存在' }, { status: 404 });
    }

    // 更新浏览数
    await client
      .from('treasure')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('treasure_id', id);

    // 获取用户收藏状态
    const { data: userTreasure } = await client
      .from('user_treasure')
      .select('is_favorite, is_read, notes')
      .eq('user_id', user.id)
      .eq('treasure_id', id)
      .single();

    return NextResponse.json({
      data: {
        ...data,
        view_count: (data.view_count || 0) + 1,
        is_favorited: userTreasure?.is_favorite || false,
        is_read: userTreasure?.is_read || false,
        user_notes: userTreasure?.notes || '',
      }
    });
  } catch (err) {
    console.error('获取资料详情失败:', err);
    return NextResponse.json({ error: '获取资料详情失败' }, { status: 500 });
  }
}
