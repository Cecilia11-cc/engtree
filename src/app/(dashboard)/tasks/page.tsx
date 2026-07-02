'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

interface Task {
  task_id: string;
  task_type: string;
  task_content: string;
  status: string;
  score: number;
  deadline: string;
}

const typeInfo: Record<string, { label: string; color: string; icon: string }> = {
  word: { label: '单词', color: 'bg-teal-500/10 text-teal-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  listening: { label: '听力', color: 'bg-amber-500/10 text-amber-600', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  reading: { label: '阅读', color: 'bg-blue-500/10 text-blue-600', icon: 'M4 19.5A2.5 2.5 0 016.5 17H20' },
  speaking: { label: '口语', color: 'bg-purple-500/10 text-purple-600', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  writing: { label: '写作', color: 'bg-rose-500/10 text-rose-600', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
};

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchTasks = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }

      const res = await fetch('/api/tasks', { headers: { 'x-session': session.access_token } });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-session': session.access_token },
        body: JSON.stringify({ task_id: taskId, status: newStatus }),
      });

      if (res.ok) {
        setTasks(tasks.map((t) => t.task_id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.task_type === filter);
  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-foreground mb-1">今日任务</h1>
      <p className="text-sm text-muted-foreground mb-6">完成每日学习任务，保持进步</p>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          全部
        </button>
        {Object.entries(typeInfo).map(([key, info]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              filter === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {info.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <>
          {/* Pending */}
          {pendingTasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">待完成 ({pendingTasks.length})</h2>
              <div className="space-y-3">
                {pendingTasks.map((task) => {
                  const info = typeInfo[task.task_type] || typeInfo.word;
                  return (
                    <div
                      key={task.task_id}
                      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-sm transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(task.task_id, task.status)}
                        className="w-5 h-5 rounded-full border-2 border-primary/50 hover:border-primary flex-shrink-0 transition-all"
                      />
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${info.color}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={info.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground">{task.task_content}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{info.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">已完成 ({completedTasks.length})</h2>
              <div className="space-y-3">
                {completedTasks.map((task) => {
                  const info = typeInfo[task.task_type] || typeInfo.word;
                  return (
                    <div
                      key={task.task_id}
                      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border opacity-60"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTask(task.task_id, task.status)}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${info.color}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d={info.icon} />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-foreground line-through">{task.task_content}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{info.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无任务</p>
              <p className="text-sm text-muted-foreground mt-1">系统将根据你的学习计划自动生成每日任务</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
