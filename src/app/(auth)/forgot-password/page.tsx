'use client';

import { useState } from 'react';

const APP_NAME = 'EngTree 英语树';
const APP_ICON = '/engtree-icon.png';

type Step = 'verify' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('verify');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: 验证身份（邮箱 + 姓名）
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '验证失败');
        return;
      }

      // 验证通过，进入设置新密码步骤
      setStep('reset');
    } catch {
      setError('验证失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: 设置新密码
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('密码至少需要 6 个字符');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '重置失败');
        return;
      }

      setStep('success');
    } catch {
      setError('重置密码失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-summer-light/30 via-background to-background p-4">
      <div className="w-full max-w-md">
        {/* App Icon & Name */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
            <img src={APP_ICON} alt={APP_NAME} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground font-serif">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground mt-1">如夏树生长，每日英语可见</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-md border border-border p-8">

          {/* Step 1: 验证身份 */}
          {step === 'verify' && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">找回密码</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  请输入你的注册邮箱和姓名来验证身份
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">注册邮箱</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="请输入注册时使用的邮箱"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">姓名</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="请输入注册时填写的姓名"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <p className="text-xs text-muted-foreground">
                      为保护账户安全，需验证你的身份信息。邮箱和姓名必须与注册时一致。
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '验证中...' : '验证身份'}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                想起密码了？
                <a href="/login" className="text-primary hover:underline ml-1">
                  返回登录
                </a>
              </p>
            </>
          )}

          {/* Step 2: 设置新密码 */}
          {step === 'reset' && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">身份验证通过</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  请为账户 <span className="text-foreground font-medium">{email}</span> 设置新密码
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">新密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="至少 6 个字符"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">确认新密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="再次输入新密码"
                    className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? '更新中...' : '重置密码'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => { setStep('verify'); setError(''); }}
                className="block mx-auto text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
              >
                返回上一步
              </button>
            </>
          )}

          {/* Step 3: 成功 */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground">密码重置成功</h2>
              <p className="text-sm text-muted-foreground">
                你的密码已成功更新，请使用新密码登录。
              </p>
              <a
                href="/login"
                className="inline-block px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all"
              >
                前往登录
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
