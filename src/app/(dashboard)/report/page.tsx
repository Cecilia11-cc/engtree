'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

interface StudyRecord {
  week: number;
  study_hours: string;
  word_count: number;
  reading_score: number;
  listening_score: number;
  writing_score: number;
  speaking_score: number;
}

interface UserProfile {
  target: string;
  level: string;
  weekly_hours: number;
}

const targetNames: Record<string, string> = {
  cet4: '英语四级',
  cet6: '英语六级',
  postgrad: '考研英语',
  job: '求职英语',
};

export default function ReportPage() {
  const router = useRouter();
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }

      const [recordsRes, userRes] = await Promise.all([
        fetch('/api/study-record', { headers: { 'x-session': session.access_token } }),
        fetch('/api/user', { headers: { 'x-session': session.access_token } }),
      ]);

      if (recordsRes.ok) {
        const data = await recordsRes.json();
        setRecords((data.data || []).sort((a: StudyRecord, b: StudyRecord) => a.week - b.week));
      }

      if (userRes.ok) {
        const data = await userRes.json();
        if (data.data) setUser(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">加载中...</div>;
  }

  const latestRecord = records[records.length - 1];
  const totalHours = records.reduce((sum, r) => sum + Number(r.study_hours), 0);
  const totalWords = records.reduce((sum, r) => sum + Number(r.word_count), 0);

  // Radar chart data
  const radarData = latestRecord
    ? [
        { subject: '阅读', score: Number(latestRecord.reading_score) },
        { subject: '听力', score: Number(latestRecord.listening_score) },
        { subject: '写作', score: Number(latestRecord.writing_score) },
        { subject: '口语', score: Number(latestRecord.speaking_score) },
      ]
    : [];

  // Weekly trend data
  const weeklyData = records.map((r) => ({
    week: `第${r.week}周`,
    学习时长: Number(r.study_hours),
    单词量: Number(r.word_count),
  }));

  // Score trend data
  const scoreData = records.map((r) => ({
    week: `第${r.week}周`,
    阅读: Number(r.reading_score),
    听力: Number(r.listening_score),
    写作: Number(r.writing_score),
    口语: Number(r.speaking_score),
  }));

  // Estimated probability
  const avgScore = latestRecord
    ? Math.round((Number(latestRecord.reading_score) + Number(latestRecord.listening_score) + Number(latestRecord.writing_score) + Number(latestRecord.speaking_score)) / 4)
    : 0;
  const probability = Math.min(99, Math.max(10, Math.round(avgScore * 0.9 + 10)));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-1">成长报告</h1>
      <p className="text-sm text-muted-foreground mb-6">
        {user ? `目标：${targetNames[user.target] || user.target}` : '学习数据分析'}
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground">累计学习时长</div>
          <div className="text-2xl font-semibold text-foreground mt-1">
            {totalHours}<span className="text-sm font-normal text-muted-foreground ml-1">小时</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground">累计单词</div>
          <div className="text-2xl font-semibold text-foreground mt-1">
            {totalWords}<span className="text-sm font-normal text-muted-foreground ml-1">个</span>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground">综合得分</div>
          <div className="text-2xl font-semibold text-foreground mt-1">{avgScore}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground">
            {user?.target === 'job' ? '面试准备度' : '达标概率'}
          </div>
          <div className="text-2xl font-semibold text-primary mt-1">{probability}%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">能力雷达图</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                <Radar name="能力" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
          )}
        </div>

        {/* Weekly Hours Bar Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">每周学习时长</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Bar dataKey="学习时长" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
          )}
        </div>

        {/* Score Trend Line Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">分数趋势</h3>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Line type="monotone" dataKey="阅读" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="听力" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="写作" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="口语" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
          )}
        </div>

        {/* Word Count Trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-medium text-foreground mb-4">单词积累趋势</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                  }}
                />
                <Bar dataKey="单词量" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}
