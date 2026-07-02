import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils, Message } from 'coze-coding-dev-sdk';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const token = request.headers.get('x-session');
    if (!token) {
      return new Response(JSON.stringify({ error: '请先登录' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = getSupabaseClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: '认证失败' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { scenario, messages: chatMessages } = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const config = new Config();
    const llmClient = new LLMClient(config, customHeaders);

    const sceneDescriptions: Record<string, string> = {
      airport: '机场值机与海关场景 - 练习登机手续、行李托运、海关申报等对话',
      academic: '学术会议交流场景 - 练习学术演讲、提问讨论、社交网络等对话',
      housing: '租房与物业沟通场景 - 练习看房、签约、报修等对话',
      library: '图书馆借阅咨询场景 - 练习借书、资料查找、学术资源使用等对话',
      interview: '求职面试准备场景 - 练习英文自我介绍、行为面试题、技术面试等对话',
    };

    const sceneDesc = sceneDescriptions[scenario] || '日常英语对话场景';

    const systemPrompt = `你是 EngTree 英语学习助手的口语对话 AI。当前场景：${sceneDesc}

规则：
1. 用英文回复，语言简洁自然，模拟真实场景对话
2. 每次回复不超过 3 句话，保持对话流畅
3. 如果用户语法有误，在对话末尾用【纠正】标注
4. 适当引导对话深入，增加场景词汇
5. 如果用户用中文回复，鼓励他们尝试用英语表达`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...(chatMessages || []).map((h: { role: 'user' | 'assistant'; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseStream = llmClient.stream(messages, {
            model: 'doubao-seed-2-0-lite-260215',
            temperature: 0.7,
          });

          for await (const chunk of responseStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : '流式输出错误';
          controller.enqueue(encoder.encode(errMsg));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
