import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to admin dashboard
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى كتابة اسم المستخدم وكلمة المرور.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await login(username.trim(), password.trim());
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-12" dir="rtl">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 shadow-inner border border-amber-500/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-white sm:text-3xl">
            لوحة تحكم البناء الراقي
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            إدارة وتحديث الأسعار والمخزون والمستخدمين
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-800/80 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-center text-sm font-semibold text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300">
                اسم المستخدم
              </label>
              <div className="relative mt-2">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pr-10 pl-4 text-sm text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <User className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300">
                كلمة المرور
              </label>
              <div className="relative mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/90 py-3 pr-10 pl-4 text-sm text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <Lock className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-center text-sm font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-700/60 pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              العودة إلى الموقع الرئيسي
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
