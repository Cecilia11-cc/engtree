import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils, Message } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const token = request.headers.get('x-session');
    if (!token) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const supabaseClient = getSupabaseClient(token);
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    const { target, level, weeklyHours, weeklyWords, major, weakAreas } = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const targetNames: Record<string, string> = {
      cet4: '英语四级',
      cet6: '英语六级',
      postgrad: '考研英语',
      ielts: '雅思',
      toefl: '托福',
      job: '求职英语',
      study_abroad: '留学日常',
      daily: '日常提升',
    };

    const levelNames: Record<string, string> = {
      beginner: '零基础',
      low: '初级',
      medium: '中级',
      high: '高级',
    };

    const systemPrompt = `你是 EngTree 英语学习助手的智能计划生成 AI。根据用户信息生成一周学习计划。

请按以下 JSON 格式返回，不要添加其他内容：
{
  "daily_plan": [
    {
      "day": "周一",
      "tasks": [
        { "task_type": "word", "task_content": "具体任务描述", "duration": 30 },
        { "task_type": "listening", "task_content": "具体任务描述", "duration": 30 }
      ],
      "total_minutes": 60
    }
  ],
  "weekly_goals": {
    "word_target": 0,
    "reading_count": 0,
    "listening_count": 0,
    "writing_count": 0,
    "speaking_count": 0
  },
  "focus_areas": ["重点1", "重点2"],
  "tips": ["建议1", "建议2"]
}`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `请为我生成一周英语学习计划：
- 目标：${targetNames[target] || target}
- 当前水平：${levelNames[level] || level}
- 每周学习时长：${weeklyHours || 8}小时
- 每周背诵单词量：${weeklyWords || 160}个
- 专业：${major || '未指定'}
- 薄弱项：${weakAreas ? weakAreas.join('、') : '暂无'}`,
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.5,
    });

    let result;
    try {
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析 JSON');
      }
    } catch {
      // Fallback plan
      const dailyWordCount = Math.ceil((weeklyWords || 160) / 7);
      result = {
        daily_plan: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => ({
          day,
          tasks: [
            { task_type: 'word', task_content: `背诵${dailyWordCount}个新单词`, duration: 30 },
            { task_type: 'listening', task_content: '完成1篇听力练习', duration: 30 },
            { task_type: 'reading', task_content: '完成1篇阅读理解', duration: 30 },
          ],
          total_minutes: 90,
        })),
        weekly_goals: {
          word_target: weeklyWords || 160,
          reading_count: 7,
          listening_count: 7,
          writing_count: 2,
          speaking_count: 2,
        },
        focus_areas: ['词汇积累', '听力训练'],
        tips: ['坚持每日打卡', '利用碎片时间背单词'],
      };
    }

    // Also create tasks in database for the user
    if (result.daily_plan) {
      const tasks = result.daily_plan.flatMap((day: { day: string; tasks: Array<{ task_type: string; task_content: string; duration: number }> }) =>
        day.tasks.map((t) => ({
          user_id: user.id,
          task_type: t.task_type,
          task_content: t.task_content,
          deadline: null,
          status: 'pending',
        }))
      );

      if (tasks.length > 0) {
        await supabaseClient.from('task').insert(tasks);
      }
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
