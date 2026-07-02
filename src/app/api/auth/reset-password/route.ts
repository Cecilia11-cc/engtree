import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/storage/database/supabase-client';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要 6 个字符' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // 通过邮箱找到用户
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        { error: '重置失败，请稍后再试' },
        { status: 500 }
      );
    }

    const authUser = usersData.users.find(
      (u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!authUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 使用 admin API 更新密码
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUser.id,
      { password }
    );

    if (updateError) {
      return NextResponse.json(
        { error: '密码重置失败：' + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
}
