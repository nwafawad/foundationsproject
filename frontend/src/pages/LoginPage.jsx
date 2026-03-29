import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { login } from '../utils/api';
import Toast from '../components/Toast';

export default function LoginPage({ navigate }) {
  const { setUser } = useAuth();
  const { lang } = useLang();
  const t = T[lang];
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !pw) { setError(t.errors.required); return; }
    setLoading(true);
    try {
      const result = await login(email.trim(), pw);
      setLoading(false);
      if (!result || !result.success) {
        setError(result?.error || t.errors.loginFailed);
        return;
      }
      setUser(result.user);
      setToast({ message: `Welcome back, ${result.user.name.split(' ')[0]}!`, type: 'success' });
      setTimeout(() => navigate(result.user.role === 'admin' ? 'admin' : 'dashboard'), 800);
    } catch (err) {
      setLoading(false);
      // Show the actual error message from the API
      const errorMessage = err?.message || err?.toString() || t.errors.loginFailed;
      setError(errorMessage);
    }
  };

  const EyeIcon = ({ open }) => open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className="auth-wrap pi">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="auth-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
              <path d="m14 16-3 3 3 3" />
              <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.572.89l3.468 6.004" />
              <path d="m18.186 12.7 1.096 4.096 4.096-1.098" />
            </svg>
            <span style={{ fontSize: 26, fontWeight: 900, background: 'linear-gradient(135deg,var(--green),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RECYX</span>
          </div>
          <h1 className="auth-h">{t.pages.login}</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
            {lang === 'en' ? "Sign in to your account to continue" : "Injira muri konti yawe"}
          </p>
        </div>

        <form onSubmit={handle} noValidate>
          {error && (
            <div className="al-d" style={{ marginBottom: 16, borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="fg">
            <label className="fl">{t.form.email}</label>
            <input
              className="fi"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="fg">
            <label className="fl">{t.form.password}</label>
            <div style={{ position: 'relative' }}>
              <input
                className="fi"
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 4,
                }}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-p"
            style={{ width: '100%', marginTop: 8, padding: '13px', fontSize: 14, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                {lang === 'en' ? 'Signing in...' : 'Injira...'}
              </span>
            ) : t.btn.login}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
          {lang === 'en' ? "Don't have an account?" : "Nta konti ufite?"}{' '}
          <button onClick={() => navigate('register')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--green)', fontWeight: 700, fontFamily: 'inherit', fontSize: 13,
          }}>
            {t.btn.register}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
          <button onClick={() => navigate('home')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text3)', fontFamily: 'inherit', fontSize: 12,
          }}>
            {lang === 'en' ? 'Back to home' : 'Subira ahabanza'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
