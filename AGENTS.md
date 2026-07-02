# EngTree 英语树 - AGENTS.md

## 项目概览

EngTree 英语树是一个面向大学生和英语学习者的智能英语学习平台，提供学习数据记录、智能任务生成、单词记忆、听说读写训练、场景对话练习和成绩可视化分析。品牌意象为"夏天的树"，象征持续、自然、充满生机的语言成长。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (邮箱登录)
- **AI**: coze-coding-dev-sdk (LLM 能力)
- **Charts**: Recharts

## 目录结构

```
├── public/                        # 静态资源
├── scripts/
│   └── seed-words.ts              # 单词种子数据
│   └── seed-treasure.ts           # 藏宝阁种子数据
├── src/
│   ├── app/
│   │   ├── (auth)/               # 认证路由组
│   │   │   ├── layout.tsx        # Auth 布局
│   │   │   └── login/page.tsx    # 登录/注册页
│   │   ├── (dashboard)/          # 主应用路由组
│   │   │   ├── layout.tsx        # Dashboard 布局（含侧边栏+名言轮换）
│   │   │   ├── page.tsx          # 首页 Dashboard
│   │   │   ├── tasks/page.tsx    # 今日任务
│   │   │   ├── words/page.tsx    # 单词计划
│   │   │   ├── speaking/page.tsx # 听说训练
│   │   │   ├── writing/page.tsx  # 作文批改
│   │   │   ├── errors/page.tsx   # 错题本
│   │   │   ├── report/page.tsx   # 成长报告
│   │   │   ├── profile/page.tsx  # 个人资料
│   │   │   ├── treasure/page.tsx # 藏宝阁
│   │   │   └── onboarding/page.tsx # 新人引导
│   │   ├── api/                  # API 路由
│   │   │   ├── supabase-config/  # Supabase 配置
│   │   │   ├── user/             # 用户 CRUD
│   │   │   ├── tasks/            # 任务 CRUD
│   │   │   ├── words/            # 单词 CRUD + 艾宾浩斯复习
│   │   │   ├── study-record/     # 学习记录 CRUD
│   │   │   ├── errors/           # 错题 CRUD
│   │   │   ├── treasure/         # 藏宝阁 CRUD
│   │   │   └── ai/
│   │   │       ├── chat/         # AI 口语对话（SSE 流式）
│   │   │       ├── essay/        # AI 作文批改
│   │   │       └── plan/         # AI 学习计划生成
│   │   ├── layout.tsx            # 根布局
│   │   └── globals.css           # 全局样式（夏日绿色主题）
│   ├── components/
│   │   ├── ui/                   # Shadcn UI 组件库
│   │   └── rotating-quote.tsx    # 夏日诗句/名言随机轮换组件
│   ├── lib/
│   │   ├── supabase-browser.ts   # 浏览器端 Supabase 客户端
│   │   ├── supabase-config-inject.tsx # 配置注入组件
│   │   └── utils.ts              # 通用工具
│   └── storage/database/
│       ├── supabase-client.ts    # 服务端 Supabase 客户端
│       └── shared/schema.ts      # 数据库 Schema
├── DESIGN.md                     # 设计规范
└── AGENTS.md                     # 本文件
```

## 数据库表

- `app_user`: 用户信息（学号、姓名、学院、专业、目标、水平）
- `study_record`: 学习记录（周、时长、单词量、各科分数）
- `task`: 任务（类型、内容、状态、截止时间）
- `word`: 单词库（单词、音标、释义、例句、分类）
- `user_word`: 用户单词学习记录（掌握度、复习次数、下次复习时间）
- `error_book`: 错题本（类型、题目、答案、解析）
- `treasure`: 藏宝阁资料库
- `user_treasure`: 用户与藏宝阁的交互记录

## API 接口

| 接口 | 方法 | 说明 | 鉴权 |
|------|------|------|------|
| /api/supabase-config | GET | Supabase 连接配置 | 无 |
| /api/user | GET/POST/PUT | 用户信息管理 | x-session |
| /api/tasks | GET/POST/PUT/DELETE | 任务管理 | x-session |
| /api/words | GET/PUT | 单词查询与学习 | x-session |
| /api/study-record | GET/POST/PUT | 学习记录 | x-session |
| /api/errors | GET/POST/PUT | 错题管理 | x-session |
| /api/treasure | GET/POST | 藏宝阁列表与交互 | x-session |
| /api/treasure/[id] | GET | 资料详情 | x-session |
| /api/ai/chat | POST | AI 口语对话（SSE 流式） | x-session |
| /api/ai/essay | POST | AI 作文批改 | x-session |
| /api/ai/plan | POST | AI 学习计划生成 | x-session |

## 开发规范

- 仅使用 pnpm 管理依赖
- TypeScript strict 模式，禁止隐式 any
- 前端通过 x-session header 传递 Supabase token
- AI 对话接口使用 SSE 流式输出
- 单词复习基于艾宾浩斯遗忘曲线算法
- 颜色使用语义化变量（bg-primary, bg-summer-light 等），禁止硬编码 hex
- 名言轮换使用 RotatingQuote 组件

## 构建与测试

- 开发: `pnpm run dev`
- 构建: `pnpm run build`
- 启动: `pnpm run start`
- 类型检查: `pnpm ts-check`
- Lint: `pnpm lint`
