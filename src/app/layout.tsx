import type { Metadata } from 'next';
import { SupabaseConfigProvider } from '@/lib/supabase-config-inject';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EngTree 英语树',
    template: '%s | EngTree',
  },
  description: '智能英语学习平台 - 学习数据记录 + 智能任务生成 + 单词记忆 + 听说读写训练 + 成长可视化分析',
  icons: {
    icon: '/engtree-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">
        <SupabaseConfigProvider>
          {children}
        </SupabaseConfigProvider>
      </body>
    </html>
  );
}
