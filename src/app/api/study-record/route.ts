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
      .from('study_record')
      .select('*')
      .eq('user_id', user.id)
      .order('week', { ascending: false });

    if (error) throw new Error(`查询学习记录失败: ${error.message}`);
    return NextResponse.json({ data });
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
      .from('study_record')
      .insert({
        user_id: user.id,
        week: body.week,
        study_hours: body.study_hours || '0',
        word_count: body.word_count || 0,
        reading_score: body.reading_score || 0,
        listening_score: body.listening_score || 0,
        writing_score: body.writing_score || 0,
        speaking_score: body.speaking_score || 0,
      })
      .select()
      .single();

    if (error) throw new Error(`创建学习记录失败: ${error.message}`);
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

    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.study_hours !== undefined) updateFields.study_hours = body.study_hours;
    if (body.word_count !== undefined) updateFields.word_count = body.word_count;
    if (body.reading_score !== undefined) updateFields.reading_score = body.reading_score;
    if (body.listening_score !== undefined) updateFields.listening_score = body.listening_score;
    if (body.writing_score !== undefined) updateFields.writing_score = body.writing_score;
    if (body.speaking_score !== undefined) updateFields.speaking_score = body.speaking_score;

    const { data, error } = await client
      .from('study_record')
      .update(updateFields)
      .eq('user_id', user.id)
      .eq('week', body.week)
      .select()
      .single();

    if (error) throw new Error(`更新学习记录失败: ${error.message}`);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
