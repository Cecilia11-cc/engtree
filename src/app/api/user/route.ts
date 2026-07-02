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
      .from('app_user')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw new Error(`查询用户失败: ${error.message}`);
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
      .from('app_user')
      .insert({
        user_id: user.id,
        name: body.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '用户',
        student_id: body.student_id,
        college: body.college,
        major: body.major,
        target: body.target || 'cet4',
        level: body.level || 'medium',
        weekly_hours: body.weekly_hours || 8,
        weekly_words: body.weekly_words || 160,
      })
      .select()
      .single();

    if (error) throw new Error(`创建用户失败: ${error.message}`);
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
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.student_id !== undefined) updateFields.student_id = body.student_id;
    if (body.college !== undefined) updateFields.college = body.college;
    if (body.major !== undefined) updateFields.major = body.major;
    if (body.target !== undefined) updateFields.target = body.target;
    if (body.level !== undefined) updateFields.level = body.level;
    if (body.weekly_hours !== undefined) updateFields.weekly_hours = body.weekly_hours;
    if (body.weekly_words !== undefined) updateFields.weekly_words = body.weekly_words;

    const { data, error } = await client
      .from('app_user')
      .update(updateFields)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw new Error(`更新用户失败: ${error.message}`);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
