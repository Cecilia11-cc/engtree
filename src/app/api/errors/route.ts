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

    const { data, error } = await client
      .from('error_book')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`查询错题失败: ${error.message}`);

    // Map to frontend format
    const mapped = (data || []).map((item: Record<string, unknown>) => ({
      error_id: item.error_id,
      user_id: item.user_id,
      error_type: item.error_type,
      content: item.question,
      correct_answer: item.correct_answer,
      source: item.analysis || '',
      created_at: item.created_at,
      review_count: 0,
      mastered: item.is_resolved,
    }));

    return NextResponse.json({ data: mapped });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { data, error } = await client
      .from('error_book')
      .insert({
        user_id: user.id,
        error_type: body.error_type,
        question: body.content,
        user_answer: body.user_answer || '',
        correct_answer: body.correct_answer,
        analysis: body.analysis || '',
        is_resolved: false,
      })
      .select()
      .single();

    if (error) throw new Error(`创建错题失败: ${error.message}`);
    return NextResponse.json({ data });
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

    const { data, error } = await client
      .from('error_book')
      .update({
        is_resolved: body.mastered ?? true,
      })
      .eq('error_id', body.error_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new Error(`更新错题失败: ${error.message}`);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
