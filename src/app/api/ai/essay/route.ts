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

    const { essay, topic } = await request.json();
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是 EngTree 英语学习助手的作文批改 AI。请从以下四个维度评分（每个维度0-100分），并给出修改建议：

1. **语法正确性** (grammar)：语法错误数量和严重程度
2. **词汇丰富度** (vocabulary)：词汇多样性、高级词汇使用
3. **逻辑结构** (structure)：段落组织、论证连贯性、过渡词使用
4. **表达自然度** (naturalness)：是否像母语者写作、有无中式英语

请严格按以下 JSON 格式返回，不要添加其他内容：
{
  "grammar": 75,
  "vocabulary": 60,
  "structure": 70,
  "naturalness": 65,
  "overall": 68,
  "suggestions": "具体的修改建议，包括语法纠错、词汇替换建议等",
  "corrected": "修改后的完整高分范文"
}`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `请批改以下英语作文：\n\n${topic ? `题目：${topic}\n\n` : ''}作文内容：\n${essay}`,
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.3,
    });

    let result: {
      grammar: number;
      vocabulary: number;
      structure: number;
      naturalness: number;
      overall: number;
      suggestions: string;
      corrected: string;
    };

    try {
      const content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        result = {
          grammar: Number(parsed.grammar) || 60,
          vocabulary: Number(parsed.vocabulary) || 60,
          structure: Number(parsed.structure) || 60,
          naturalness: Number(parsed.naturalness) || 60,
          overall: Number(parsed.overall) || 60,
          suggestions: String(parsed.suggestions || ''),
          corrected: String(parsed.corrected || ''),
        };
      } else {
        throw new Error('无法解析 JSON');
      }
    } catch {
      result = {
        grammar: 60,
        vocabulary: 55,
        structure: 65,
        naturalness: 55,
        overall: 59,
        suggestions: response.content || '暂无建议',
        corrected: '',
      };
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
