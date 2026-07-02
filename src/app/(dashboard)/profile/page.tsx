'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface UserProfile {
  user_id: string;
  name: string;
  student_id: string;
  college: string;
  major: string;
  target: string;
  level: string;
  weekly_hours: number;
  weekly_words: number;
}

const targetNames: Record<string, string> = {
  cet4: '英语四级',
  cet6: '英语六级',
  postgrad: '考研英语',
  ielts: '雅思 IELTS',
  toefl: '托福 TOEFL',
  job: '求职英语',
  abroad: '留学日常',
  daily: '日常提升',
};

const levelNames: Record<string, string> = {
  beginner: '零基础',
  low: '初级',
  medium: '中级',
  high: '高级',
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }

      const res = await fetch('/api/user', { headers: { 'x-session': session.access_token } });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.data || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">加载中...</div>;
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-16">
        <p className="text-muted-foreground">未找到个人资料</p>
        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="mt-4 px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          完善资料
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-1">个人资料</h1>
      <p className="text-sm text-muted-foreground mb-6">你的学习信息</p>

      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{profile.name}</h2>
            <p className="text-sm text-muted-foreground">学号 {profile.student_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '学院', value: profile.college },
            { label: '专业', value: profile.major },
            { label: '学习目标', value: targetNames[profile.target] || profile.target },
            { label: '英语水平', value: levelNames[profile.level] || profile.level },
            { label: '每周学习时长', value: `${profile.weekly_hours} 小时` },
            { label: '每周背诵单词', value: `${profile.weekly_words} 个` },
          ].map((item) => (
            <div key={item.label}>
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="text-foreground font-medium mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push('/onboarding')}
          className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          修改资料
        </button>
      </div>
    </div>
  );
}
