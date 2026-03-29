import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { register, login } from '../utils/api';
import { sectorsByDistrict } from '../data/sectors';
import Toast from '../components/Toast';

const ROLES = [
  { key: 'citizen', icon: 'user', color: '#7c3aed', bg: '#ede9fe' },
  { key: 'buyer', icon: 'shop', color: '#db2777', bg: '#fce7f3' },
  { key: 'technician', icon: 'wrench', color: '#0ea5e9', bg: '#e0f2fe' },
  { key: 'recycler', icon: 'recycle', color: '#16a34a', bg: '#dcfce7' },
];

function RoleIcon({ name, size = 22 }) {
  const icons = {
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    shop: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
    wrench: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
    recycle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" /><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" /><path d="m14 16-3 3 3 3" /><path d="M8.293 13.596 7.196 9.5 3.1 10.598" /><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.572.89l3.468 6.004" /><path d="m18.186 12.7 1.096 4.096 4.096-1.098" /></svg>,
  };
  return icons[name] || null;
}

function pwStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'good';
  return 'strong';
}

const STRENGTH_COLORS = { weak: '#ef4444', fair: '#f59e0b', good: '#0ea5e9', strong: '#16a34a' };
const STRENGTH_WIDTHS = { weak: '25%', fair: '50%', good: '75%', strong: '100%' };

const SPECS = ['Smartphones & Tablets', 'Laptops & Computers', 'Home Appliances', 'TVs & Monitors', 'Solar Panels & Inverters', 'Printers & Copiers', 'General Electronics'];

export default function RegisterPage({ navigate }) {
  const { setUser } = useAuth();
  const { lang } = useLang();
  const t = T[lang];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', role: '', password: '', confirmPassword: '', sector: '', district: '', specialization: '', company: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = t.errors.required;
    if (!form.email.trim()) e.email = t.errors.required;
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t.errors.invalidEmail;
    if (!form.role) e.role = t.errors.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.password) e.password = t.errors.required;
    else if (form.password.length < 8) e.password = t.errors.passwordTooShort;
    if (form.password !== form.confirmPassword) e.confirmPassword = t.errors.passwordMismatch;
    if (!form.sector) e.sector = t.errors.required;
    if (form.role === 'technician' && !form.specialization) e.specialization = t.errors.required;
    if (form.role === 'recycler' && !form.company.trim()) e.company = t.errors.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext1 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleNext2 = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        sector: form.sector,
      });
      if (['citizen', 'buyer'].includes(form.role)) {
        // Auto-verified roles: log in immediately
        try {
          const loginRes = await login(form.email.trim().toLowerCase(), form.password);
          setLoading(false);
          if (loginRes.success) {
            setUser(loginRes.user);
            setToast({ message: t.success.registered, type: 'success' });
            setTimeout(() => navigate('dashboard'), 1000);
            return;
          }
        } catch {
          // Auto-login failed; fall through to redirect to login
        }
        setLoading(false);
        setToast({ message: t.success.registered, type: 'success' });
        setTimeout(() => navigate('login'), 1200);
      } else {
        // technician/recycler require admin approval
        setLoading(false);
        setStep(4);
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.message || 'Registration failed. Please try again.';
      setErrors({ submit: msg });
    }
  };

  const strength = pwStrength(form.password);

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

      <div className="auth-card" style={{ maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" /><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" /><path d="m14 16-3 3 3 3" /><path d="M8.293 13.596 7.196 9.5 3.1 10.598" /><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.572.89l3.468 6.004" /><path d="m18.186 12.7 1.096 4.096 4.096-1.098" />
            </svg>
            <span style={{ fontSize: 22, fontWeight: 900, background: 'linear-gradient(135deg,var(--green),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RECYX</span>
          </div>
          <h1 className="auth-h">{t.pages.register}</h1>
        </div>

        {/* Step indicator (steps 1-3) */}
        {step <= 3 && (
          <div className="step-bar">
            {[t.register.step1, t.register.step2, t.register.step3].map((s, i) => (
              <div key={i} className={`step-item${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', border: `2px solid ${step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--green)' : 'var(--border)'}`,
                  background: step > i + 1 ? 'var(--green)' : step === i + 1 ? 'var(--green-l)' : 'transparent',
                  color: step > i + 1 ? '#fff' : step === i + 1 ? 'var(--green)' : 'var(--text3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: step === i + 1 ? 'var(--green)' : 'var(--text3)', fontWeight: step === i + 1 ? 700 : 400 }}>{s}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? 'var(--green)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            <div className="fg">
              <label className="fl">{t.form.name}</label>
              <input className="fi" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Pacifique Mugabo" autoFocus />
              {errors.name && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.name}</p>}
            </div>

            <div className="fg">
              <label className="fl">{t.form.email}</label>
              <input className="fi" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              {errors.email && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.email}</p>}
            </div>

            <div className="fg">
              <label className="fl">{t.register.chooseRole}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                {ROLES.map(r => (
                  <div key={r.key} onClick={() => set('role', r.key)} style={{
                    padding: '14px 12px', borderRadius: 14, cursor: 'pointer', transition: '.2s',
                    border: form.role === r.key ? `2px solid ${r.color}` : '1px solid var(--border)',
                    background: form.role === r.key ? r.bg : 'var(--bg2)',
                  }}>
                    <div style={{ color: r.color, marginBottom: 6 }}>
                      <RoleIcon name={r.icon} size={20} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: form.role === r.key ? r.color : 'var(--text)' }}>
                      {t.roles[r.key]}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 3, lineHeight: 1.4 }}>
                      {t.roles[`${r.key}Desc`]}
                    </div>
                  </div>
                ))}
              </div>
              {errors.role && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.role}</p>}
            </div>

            <button className="btn-p" style={{ width: '100%', marginTop: 4, justifyContent: 'center' }} onClick={handleNext1}>
              {t.btn.next}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text2)' }}>
              {lang === 'en' ? 'Already have an account?' : 'Ufite konti?'}{' '}
              <button onClick={() => navigate('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--green)', fontWeight: 700, fontFamily: 'inherit', fontSize: 13 }}>
                {t.btn.login}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            <div className="fg">
              <label className="fl">{t.form.password}</label>
              <div style={{ position: 'relative' }}>
                <input className="fi" type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: STRENGTH_WIDTHS[strength], background: STRENGTH_COLORS[strength], borderRadius: 4, transition: 'width .4s' }} />
                  </div>
                  <p style={{ fontSize: 11, color: STRENGTH_COLORS[strength], marginTop: 3, fontWeight: 600 }}>
                    {t.register.passwordStrength[strength]}
                  </p>
                </div>
              )}
              {errors.password && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.password}</p>}
            </div>

            <div className="fg">
              <label className="fl">{t.form.confirmPassword}</label>
              <input className="fi" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••" />
              {errors.confirmPassword && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.confirmPassword}</p>}
            </div>

            <div className="fg">
              <label className="fl">{t.form.district}</label>
              <select className="fs" value={form.district} onChange={e => { set('district', e.target.value); set('sector', ''); }}>
                <option value="">{lang === 'en' ? 'Select district...' : 'Hitamo akarere...'}</option>
                {Object.keys(sectorsByDistrict).sort().map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {form.district && (
              <div className="fg">
                <label className="fl">{t.form.sector}</label>
                <select className="fs" value={form.sector} onChange={e => set('sector', e.target.value)}>
                  <option value="">{lang === 'en' ? 'Select sector...' : 'Hitamo akagari...'}</option>
                  {sectorsByDistrict[form.district]?.map(s => <option key={s} value={`${s}, ${form.district}`}>{s}</option>)}
                </select>
                {errors.sector && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.sector}</p>}
              </div>
            )}

            {form.role === 'technician' && (
              <div className="fg">
                <label className="fl">{t.form.specialization}</label>
                <select className="fs" value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                  <option value="">{lang === 'en' ? 'Select specialization...' : 'Hitamo inzobere...'}</option>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.specialization && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.specialization}</p>}
              </div>
            )}

            {form.role === 'recycler' && (
              <div className="fg">
                <label className="fl">{t.form.company}</label>
                <input className="fi" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your recycling company name" />
                {errors.company && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.company}</p>}
              </div>
            )}

            {errors.submit && (
              <div className="al-d" style={{ marginBottom: 12, borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
                {errors.submit}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button className="btn-g" style={{ flex: 1 }} onClick={() => setStep(1)}>{t.btn.back}</button>
              <button className="btn-p" style={{ flex: 2, justifyContent: 'center' }} onClick={handleNext2} disabled={loading}>
                {loading ? (lang === 'en' ? 'Creating...' : 'Ushyirwaho...') : t.btn.next}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Pending ── */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--amber-l)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10 }}>
              {lang === 'en' ? 'Account Under Review' : 'Konti Irareberwa'}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 22 }}>
              {t.register.pendingDesc}
            </p>
            <div className="al-i" style={{ borderRadius: 12, padding: 14, marginBottom: 20, fontSize: 13 }}>
              <strong>{lang === 'en' ? 'Next steps:' : 'Intambwe zikurikira:'}</strong>
              <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.8, textAlign: 'left' }}>
                <li>{lang === 'en' ? 'Admin review (1-2 business days)' : 'Isuzumwa na Umuyobozi (Iminsi 1-2)'}</li>
                <li>{lang === 'en' ? 'Possible in-person visit to your location' : 'Gusura aho ubarizwa bishoboka'}</li>
                <li>{lang === 'en' ? 'Email notification upon approval' : 'Email iyo yemejwe'}</li>
              </ul>
            </div>
            <button className="btn-p" style={{ width: '100%' }} onClick={() => navigate('home')}>
              {lang === 'en' ? 'Return to Homepage' : 'Subira Ahabanza'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
