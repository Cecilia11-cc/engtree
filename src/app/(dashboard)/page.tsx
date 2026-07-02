'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import Link from 'next/link';
import RotatingQuote from '@/components/rotating-quote';

interface Task {
  task_id: string;
  task_type: string;
  task_content: string;
  status: string;
  score: number;
  deadline: string;
}

interface UserProfile {
  user_id: string;
  name: string;
  target: string;
  level: string;
  weekly_hours: number;
  weekly_words: number;
  major: string;
}

interface StudyRecord {
  week: number;
  study_hours: string;
  word_count: number;
  reading_score: number;
  listening_score: number;
  writing_score: number;
  speaking_score: number;
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

const typeIcons: Record<string, { icon: string; color: string; label: string }> = {
  word: { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-primary/10 text-primary', label: '单词' },
  listening: { icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'bg-summer-warm/60 text-amber-700', label: '听力' },
  reading: { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-primary/10 text-primary', label: '阅读' },
  speaking: { icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z', color: 'bg-summer-warm/60 text-amber-700', label: '口语' },
  writing: { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'bg-primary/10 text-primary', label: '写作' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const token = session.access_token;

      const [userRes, tasksRes, recordsRes] = await Promise.all([
        fetch('/api/user', { headers: { 'x-session': token } }),
        fetch('/api/tasks?status=pending', { headers: { 'x-session': token } }),
        fetch('/api/study-record', { headers: { 'x-session': token } }),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.data) {
          setUser(userData.data);
        } else {
          router.replace('/onboarding');
          return;
        }
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.data || []);
      }

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData.data || []);
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

  const todayTasks = tasks.filter((t) => {
    if (!t.deadline) return true;
    const deadline = new Date(t.deadline);
    const today = new Date();
    return deadline.toDateString() === today.toDateString();
  });

  const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
  const totalToday = todayTasks.length || tasks.length;
  const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const latestRecord = records[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Welcome — summer green header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground font-serif">
            {user ? `你好，${user.name}` : '你好'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user ? `目标：${targetNames[user.target] || user.target} · 每周${user.weekly_hours}小时` : '欢迎使用 EngTree'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
      </div>

      {/* Quote Banner */}
      <div className="bg-summer-light/40 rounded-xl border border-primary/10 px-5 py-4">
        <RotatingQuote />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--muted)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="var(--primary)" strokeWidth="8"
                strokeDasharray={`${progress * 2.83} ${283 - progress * 2.83}`}
                strokeLinecap="round"
                className="animate-progress"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-primary">
              {progress}%
            </span>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">今日进度</div>
            <div className="text-lg font-semibold text-foreground">{completedToday}/{totalToday}</div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground">本周学习时长</div>
          <div className="text-2xl font-semibold text-foreground mt-1">
            {latestRecord?.study_hours || '0'}<span className="text-sm font-normal text-muted-foreground ml-1">小时</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground">累计单词</div>
          <div className="text-2xl font-semibold text-foreground mt-1">
            {latestRecord?.word_count || 0}<span className="text-sm font-normal text-muted-foreground ml-1">个</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <div className="text-sm text-muted-foreground">综合得分</div>
          <div className="text-2xl font-semibold text-foreground mt-1">
            {latestRecord
              ? Math.round((Number(latestRecord.reading_score) + Number(latestRecord.listening_score) + Number(latestRecord.writing_score) + Number(latestRecord.speaking_score)) / 4)
              : 0}
            <span className="text-sm font-normal text-muted-foreground ml-1">分</span>
          </div>
        </div>
      </div>

      {/* Module Cards — summer green style */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { href: '/tasks', label: '今日任务', desc: '完成每日学习任务', bg: 'bg-primary/8', icon: typeIcons.word.icon, iconColor: 'text-primary' },
          { href: '/words', label: '单词计划', desc: '智能背词与复习', bg: 'bg-primary/8', icon: typeIcons.listening.icon, iconColor: 'text-primary' },
          { href: '/speaking', label: '听说训练', desc: 'AI 口语对话练习', bg: 'bg-summer-warm/30', icon: typeIcons.reading.icon, iconColor: 'text-amber-700' },
          { href: '/writing', label: '作文批改', desc: '四维评分与建议', bg: 'bg-primary/8', icon: typeIcons.writing.icon, iconColor: 'text-primary' },
          { href: '/errors', label: '错题本', desc: '薄弱项强化训练', bg: 'bg-summer-warm/30', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', iconColor: 'text-amber-700' },
          { href: '/treasure', label: '藏宝阁', desc: '精选学习资料库', bg: 'bg-summer-warm/30', icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', iconColor: 'text-amber-700' },
        ].map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group bg-card rounded-xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className={`w-10 h-10 rounded-lg ${module.bg} flex items-center justify-center mb-3`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={module.iconColor}>
                <path d={module.icon} />
              </svg>
            </div>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{module.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{module.desc}</p>
          </Link>
        ))}
      </div>

      {/* Today's Tasks & Growth Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">今日任务</h2>
            <Link href="/tasks" className="text-sm text-primary hover:underline">查看全部</Link>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">暂无待完成任务</p>
              <p className="text-muted-foreground text-xs mt-1">完成新人引导后系统将自动生成学习计划</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => {
                const typeInfo = typeIcons[task.task_type] || typeIcons.word;
                return (
                  <div key={task.task_id} className="flex items-center gap-3 p-3 rounded-lg bg-summer-light/30">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={typeInfo.icon} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground truncate">{task.task_content}</div>
                      <div className="text-xs text-muted-foreground">{typeInfo.label}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'completed'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {task.status === 'completed' ? '已完成' : '待完成'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Growth Report Preview */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">能力分布</h2>
            <Link href="/report" className="text-sm text-primary hover:underline">详细报告</Link>
          </div>
          {latestRecord ? (
            <div className="space-y-4">
              {[
                { label: '阅读', value: Number(latestRecord.reading_score), color: 'bg-primary' },
                { label: '听力', value: Number(latestRecord.listening_score), color: 'bg-summer-warm' },
                { label: '写作', value: Number(latestRecord.writing_score), color: 'bg-primary/70' },
                { label: '口语', value: Number(latestRecord.speaking_score), color: 'bg-summer-warm/70' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${Math.min(item.value, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">暂无学习数据</p>
              <p className="text-muted-foreground text-xs mt-1">开始学习后将展示能力分布</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
