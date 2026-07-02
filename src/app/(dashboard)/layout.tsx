'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

const RotatingQuote = dynamic(() => import('@/components/rotating-quote'), {
  ssr: false,
  loading: () => <div className="h-10" />,
});

const navItems = [
  { href: '/', label: '首页', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
  { href: '/tasks', label: '今日任务', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { href: '/words', label: '单词计划', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { href: '/speaking', label: '听说训练', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
  { href: '/writing', label: '作文批改', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { href: '/errors', label: '错题本', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/treasure', label: '藏宝阁', icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' },
  { href: '/report', label: '成长报告', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const authCheckRef = useRef(false);

  useEffect(() => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    let mounted = true;

    const checkAuth = async () => {
      try {
        const supabase = await getSupabaseBrowserClientWithRetry();
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (!session) {
          router.replace('/login');
          return;
        }
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '用户');
        setAuthChecked(true);
      } catch {
        if (mounted) {
          router.replace('/login');
        }
      }
    };

    checkAuth();
    return () => { mounted = false; };
  }, [router]);

  // Listen for auth state changes
  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;

    const setupListener = async () => {
      try {
        const supabase = await getSupabaseBrowserClientWithRetry();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'SIGNED_OUT') {
            router.replace('/login');
          }
        });
        sub = subscription;
      } catch {
        // Ignore
      }
    };

    setupListener();
    return () => { sub?.unsubscribe(); };
  }, [router]);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border bg-sidebar sidebar-leaf-pattern transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Logo — tree + person icon */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/engtree-icon.png" alt="EngTree" className="w-full h-full object-cover rounded-lg" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm leading-tight">EngTree</span>
              <span className="text-[10px] text-muted-foreground/70 leading-tight">英语树</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0"
                >
                  <path d={item.icon} />
                </svg>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Rotating Quote (only when expanded) */}
        {!collapsed && (
          <div className="px-4 pb-3 border-t border-border pt-3">
            <RotatingQuote />
          </div>
        )}

        {/* User & Collapse */}
        <div className="border-t border-border p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-1.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-foreground truncate">{userName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-primary/5 hover:text-foreground transition-all text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {collapsed ? (
                  <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                ) : (
                  <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                )}
              </svg>
              {!collapsed && <span>收起</span>}
            </button>
            {!collapsed && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all text-sm"
                title="退出登录"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
                </svg>
                <span>退出</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Logout Confirm Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-foreground/20 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-lg border border-border p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-foreground mb-2">确认退出</h3>
            <p className="text-sm text-muted-foreground mb-6">退出后需要重新登录才能使用</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-all text-sm"
              >
                取消
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const supabase = await getSupabaseBrowserClientWithRetry();
                    await supabase.auth.signOut();
                    router.replace('/login');
                  } catch {
                    router.replace('/login');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all text-sm"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
