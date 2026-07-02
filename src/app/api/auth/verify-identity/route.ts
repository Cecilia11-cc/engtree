import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/storage/database/supabase-client';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: '请输入邮箱和姓名' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // 1. 通过邮箱找到 auth.users 中的用户
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { error: '验证失败，请稍后再试' },
        { status: 500 }
      );
    }

    const authUser = usersData.users.find(
      (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!authUser) {
      return NextResponse.json(
        { error: '该邮箱未注册' },
        { status: 404 }
      );
    }

    // 2. 在 app_user 表中验证姓名
    const { data: appUser, error: appError } = await supabase
      .from('app_user')
      .select('name')
      .eq('user_id', authUser.id)
      .single();

    if (appError || !appUser) {
      return NextResponse.json(
        { error: '用户信息未找到' },
        { status: 404 }
      );
    }

    // 3. 验证姓名是否匹配
    if (appUser.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
      return NextResponse.json(
        { error: '姓名与注册信息不匹配' },
        { status: 403 }
      );
    }

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}
