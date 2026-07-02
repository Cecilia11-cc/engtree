'use client';

import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ---- 数据定义 ----

const TARGET_OPTIONS = [
  {
    value: 'cet4',
    label: '英语四级',
    subtitle: 'CET-4',
    desc: '大学四级英语考试，词汇量约 4500，侧重基础语法与阅读理解',
    icon: '🎓',
    tags: ['基础语法', '阅读理解', '听力基础', '写作入门'],
    vocab: '~4,500',
    difficulty: '入门',
  },
  {
    value: 'cet6',
    label: '英语六级',
    subtitle: 'CET-6',
    desc: '大学六级英语考试，词汇量约 6000，强调长篇阅读与翻译能力',
    icon: '📚',
    tags: ['长篇阅读', '翻译写作', '听力进阶', '词汇拓展'],
    vocab: '~6,000',
    difficulty: '进阶',
  },
  {
    value: 'postgrad',
    label: '考研英语',
    subtitle: 'Postgraduate',
    desc: '研究生入学考试英语，注重长难句分析、学术阅读与高分写作',
    icon: '🏛️',
    tags: ['长难句', '学术阅读', '高分写作', '翻译精练'],
    vocab: '~5,500+',
    difficulty: '高阶',
  },
  {
    value: 'ielts',
    label: '雅思 IELTS',
    subtitle: 'IELTS',
    desc: '国际英语语言测试，听说读写全面考察，适用于留学与移民',
    icon: '🌍',
    tags: ['口语对话', '学术写作', '听力多元', '阅读提速'],
    vocab: '~7,000',
    difficulty: '高阶',
  },
  {
    value: 'toefl',
    label: '托福 TOEFL',
    subtitle: 'TOEFL',
    desc: '北美留学英语能力测试，偏学术场景，强调信息整合与表达',
    icon: '🇺🇸',
    tags: ['学术听力', '综合写作', '口语独立题', '阅读推断'],
    vocab: '~8,000',
    difficulty: '挑战',
  },
  {
    value: 'job',
    label: '求职英语',
    subtitle: 'Career',
    desc: '面试自我介绍、行为面试题、职场邮件与会议沟通',
    icon: '💼',
    tags: ['自我介绍', '行为面试', '职场邮件', '会议英语'],
    vocab: '~3,000',
    difficulty: '实用',
  },
  {
    value: 'abroad',
    label: '留学日常',
    subtitle: 'Study Abroad',
    desc: '海外生活场景英语：租房、购物、就医、社交与行政事务',
    icon: '✈️',
    tags: ['租房沟通', '就医挂号', '社交口语', '银行事务'],
    vocab: '~4,000',
    difficulty: '实用',
  },
  {
    value: 'daily',
    label: '日常提升',
    subtitle: 'General',
    desc: '无明确考试目标，系统提升听说读写综合能力',
    icon: '🌱',
    tags: ['口语流利', '阅读拓展', '听力习惯', '写作表达'],
    vocab: '自定',
    difficulty: '灵活',
  },
];

const LEVEL_OPTIONS = [
  {
    value: 'beginner',
    label: '零基础 / 初学',
    desc: '词汇量 < 1500，基本语法尚未掌握',
    detail: '适合从音标、基础词汇和简单句型开始学习',
  },
  {
    value: 'low',
    label: '初级',
    desc: '词汇量 1500~3000，能进行简单日常对话',
    detail: '需要巩固语法基础，扩展核心词汇',
  },
  {
    value: 'medium',
    label: '中级',
    desc: '词汇量 3000~5000，能阅读一般文章',
    detail: '重点突破长难句、听力和写作短板',
  },
  {
    value: 'high',
    label: '高级',
    desc: '词汇量 5000+，能流畅阅读和表达',
    detail: '追求地道表达、学术写作和专业场景应用',
  },
];

const COLLEGE_OPTIONS = [
  '计算机学院', '电子信息学院', '机械工程学院', '经济管理学院',
  '外国语学院', '法学院', '医学院', '建筑与城市规划学院',
  '数学与统计学院', '化学与化工学院', '文学院', '新闻传播学院',
  '其他',
];

const MAJOR_MAP: Record<string, string[]> = {
  '计算机学院': ['计算机科学与技术', '软件工程', '人工智能', '信息安全', '数据科学', '其他'],
  '电子信息学院': ['电子信息工程', '通信工程', '微电子', '其他'],
  '机械工程学院': ['机械设计制造', '车辆工程', '工业设计', '其他'],
  '经济管理学院': ['工商管理', '会计学', '金融学', '经济学', '市场营销', '其他'],
  '外国语学院': ['英语', '日语', '法语', '德语', '其他'],
  '法学院': ['法学', '知识产权', '其他'],
  '医学院': ['临床医学', '口腔医学', '护理学', '药学', '其他'],
  '建筑与城市规划学院': ['建筑学', '城市规划', '景观设计', '其他'],
  '数学与统计学院': ['数学', '应用数学', '统计学', '其他'],
  '化学与化工学院': ['化学', '化学工程', '材料科学', '其他'],
  '文学院': ['汉语言文学', '历史学', '哲学', '其他'],
  '新闻传播学院': ['新闻学', '传播学', '广告学', '其他'],
  '其他': ['其他'],
};

// ---- 组件 ----

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    student_id: '',
    college: '',
    major: '',
    target: '',
    level: '',
    weekly_hours: 8,
    weekly_words: 160,
  });
  const [loading, setLoading] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const canProceed = () => {
    if (step === 0) return form.name.trim() !== '' && form.college !== '';
    if (step === 1) return form.target !== '';
    if (step === 2) return form.level !== '';
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        router.replace('/login');
        return;
      }

      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': token,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || '保存用户信息失败');
      }

      // Generate learning plan
      await fetch('/api/ai/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': token,
        },
        body: JSON.stringify({
          target: form.target,
          level: form.level,
          weeklyHours: form.weekly_hours,
          weeklyWords: form.weekly_words,
          major: form.major,
        }),
      });

      router.replace('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存失败，请重试';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedTarget = TARGET_OPTIONS.find(t => t.value === form.target);

  const steps = [
    // Step 0: Basic info
    {
      title: '基本信息',
      subtitle: '让我们更好地了解你，定制专属学习方案',
      content: (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="请输入你的姓名"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">学号</label>
            <input
              type="text"
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              placeholder="选填，方便学校统计"
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              学院 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.college}
              onChange={(e) => setForm({ ...form, college: e.target.value, major: '' })}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
            >
              <option value="">请选择学院</option>
              {COLLEGE_OPTIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {form.college && MAJOR_MAP[form.college] && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">专业</label>
              <select
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="">请选择专业</option>
                {MAJOR_MAP[form.college].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}
          {form.college === '其他' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">请输入你的学院</label>
              <input
                type="text"
                value={form.college === '其他' ? '' : form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                placeholder="请输入学院名称"
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          )}
        </div>
      ),
    },

    // Step 1: Learning goals (rich)
    {
      title: '学习目标',
      subtitle: '选择你的主要学习目标，我们将为你量身定制学习路径',
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {TARGET_OPTIONS.map((item) => {
              const isSelected = form.target === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setForm({ ...form, target: item.value })}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all duration-200 group',
                    isSelected
                      ? 'border-primary bg-primary/8 shadow-sm shadow-primary/10'
                      : 'border-border hover:border-primary/40 hover:bg-muted/30'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{item.icon}</span>
                    <span className={cn(
                      'font-semibold text-sm',
                      isSelected ? 'text-primary' : 'text-foreground'
                    )}>
                      {item.label}
                    </span>
                  </div>
                  <div className={cn(
                    'text-xs mb-2',
                    isSelected ? 'text-primary/70' : 'text-muted-foreground'
                  )}>
                    {item.desc}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {item.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full',
                          isSelected
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected target detail */}
          {selectedTarget && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedTarget.icon}</span>
                <span className="font-semibold text-foreground">{selectedTarget.label}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  {selectedTarget.difficulty}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedTarget.desc}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>目标词汇量：<span className="text-foreground font-medium">{selectedTarget.vocab}</span></span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {selectedTarget.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },

    // Step 2: Level & Schedule
    {
      title: '水平评估与学习安排',
      subtitle: '评估当前英语水平，设定每周学习节奏',
      content: (
        <div className="space-y-6">
          {/* Level selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              当前英语水平 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {LEVEL_OPTIONS.map((item) => {
                const isSelected = form.level === item.value;
                const isExpanded = expandedLevel === item.value;
                return (
                  <div key={item.value}>
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, level: item.value });
                        setExpandedLevel(isExpanded ? null : item.value);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/8'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected ? 'border-primary' : 'border-muted-foreground/30'
                      )}>
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={cn(
                          'font-medium text-sm',
                          isSelected ? 'text-primary' : 'text-foreground'
                        )}>
                          {item.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <svg
                        className={cn(
                          'w-4 h-4 text-muted-foreground transition-transform',
                          isExpanded ? 'rotate-180' : ''
                        )}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="ml-8 mt-1 mb-1 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        {item.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly hours slider */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              每周学习时长
            </label>
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">{form.weekly_hours}</span>
                <span className="text-sm text-muted-foreground">小时 / 周</span>
              </div>
              <input
                type="range"
                min="2"
                max="25"
                value={form.weekly_hours}
                onChange={(e) => setForm({ ...form, weekly_hours: parseInt(e.target.value) })}
                className="w-full accent-primary h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>2h 轻松</span>
                <span>10h 均衡</span>
                <span>25h 冲刺</span>
              </div>
            </div>
          </div>

          {/* Weekly words slider */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              每周背诵单词量
            </label>
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-primary">{form.weekly_words}</span>
                <span className="text-sm text-muted-foreground">个 / 周</span>
              </div>
              <input
                type="range"
                min="30"
                max="500"
                step="10"
                value={form.weekly_words}
                onChange={(e) => setForm({ ...form, weekly_words: parseInt(e.target.value) })}
                className="w-full accent-primary h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>30 温故</span>
                <span>160 均衡</span>
                <span>500 突击</span>
              </div>
            </div>
          </div>

          {/* Preview plan */}
          {form.level && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <div className="text-sm font-medium text-foreground mb-2">预估学习计划</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  每天背 <span className="text-foreground font-medium">{Math.ceil(form.weekly_words / 7)}</span> 个单词
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  每周 <span className="text-foreground font-medium">{Math.max(1, Math.round(form.weekly_hours * 0.25))}</span> 篇阅读
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  每周 <span className="text-foreground font-medium">{Math.max(1, Math.round(form.weekly_hours * 0.2))}</span> 次听力
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  每周 <span className="text-foreground font-medium">{Math.max(1, Math.round(form.weekly_hours * 0.15))}</span> 篇作文
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-background p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <img src="/engtree-icon.png" alt="EngTree" className="w-12 h-12 rounded-xl mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-foreground mb-1">EngTree 英语树</h1>
          <p className="text-sm text-muted-foreground">三步完成设置，开启你的英语学习之旅</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { if (i < step) setStep(i); }}
              className="flex-1 group"
              disabled={i > step}
            >
              <div className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i < step ? 'bg-primary' :
                i === step ? 'bg-primary/60' :
                'bg-muted'
              )} />
              <div className={cn(
                'text-xs mt-1.5 transition-colors text-center',
                i <= step ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
                {s.title}
              </div>
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-md border border-border p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">{currentStep.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{currentStep.subtitle}</p>
          </div>

          {currentStep.content}

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-all"
              >
                上一步
              </button>
            ) : (
              <div />
            )}
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                下一步
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canProceed()}
                className="px-8 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {loading ? '正在生成学习计划...' : '开始学习'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
