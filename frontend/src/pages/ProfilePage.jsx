import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { updateUser } from '../utils/api';
import { sectorsByDistrict } from '../data/sectors';
import Toast from '../components/Toast';

const SPECS = ['Smartphones & Tablets', 'Laptops & Computers', 'Home Appliances', 'TVs & Monitors', 'Solar Panels & Inverters', 'Printers & Copiers', 'General Electronics'];

export default function ProfilePage({ navigate, theme, setTheme }) {
  const { user, setUser } = useAuth();
  const { lang } = useLang();
  const t = T[lang];
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    district: user?.sector?.split(', ')[1] || '',
    sector: user?.sector || '',
    specialization: user?.spec || '',
    company: user?.company || '',
  });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [photo, setPhoto] = useState(user?.profilePhoto || null);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPF = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 4 * 1024 * 1024) {
      setToast({ message: lang === 'en' ? 'Image must be under 4MB.' : 'Ifoto igomba kuba munsi ya 4MB.', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = t.errors.required;
    if (!form.sector) e.sector = t.errors.required;
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const res = await updateUser({
        name: form.name.trim(),
        phone: form.phone.trim(),
        district: form.district || form.sector?.split(', ')[1] || '',
      });
      if (res.success) {
        setUser({ ...res.user, profilePhoto: photo, spec: form.specialization, company: form.company.trim() });
        setToast({ message: lang === 'en' ? 'Profile updated successfully!' : 'Umwirondoro wavuguruwe neza!', type: 'success' });
      } else {
        setToast({ message: res.error || 'Failed to update profile', type: 'error' });
      }
    } catch (err) {
      setToast({ message: err?.message || 'Failed to update profile', type: 'error' });
    }
    setSaving(false);
  };

  const handlePasswordChange = () => {
    const e = {};
    if (!pwForm.current) e.current = t.errors.required;
    else if (pwForm.current !== user.pw) e.current = lang === 'en' ? 'Incorrect current password.' : 'Ijambo banga ntabwo ari ryo.';
    if (!pwForm.newPw || pwForm.newPw.length < 8) e.newPw = t.errors.passwordTooShort;
    if (pwForm.newPw !== pwForm.confirm) e.confirm = t.errors.passwordMismatch;
    setPwErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    setTimeout(() => {
      const res = updateUser(user.id, { pw: pwForm.newPw });
      if (res.success) {
        setUser(res.user);
        setPwForm({ current: '', newPw: '', confirm: '' });
        setToast({ message: lang === 'en' ? 'Password changed successfully!' : 'Ijambo banga ryahinduwe neza!', type: 'success' });
      }
      setSaving(false);
    }, 600);
  };

  const EyeIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {showPw
        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>}
    </svg>
  );

  if (!user) return null;

  const roleName = t.roles[user.role] || user.role;

  return (
    <div className="pg pi content-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page header */}
      <div className="pg-h">
        <h1 className="pg-t">{lang === 'en' ? 'Profile & Settings' : 'Umwirondoro n\'Igenamiterere'}</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 6 }}>
          {lang === 'en' ? 'Manage your personal information and preferences.' : 'Genzura amakuru yawe bwite n\'ibyifuzo.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── LEFT: Photo card ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="gc" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {/* Avatar / photo */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 96, height: 96, borderRadius: 28,
                background: photo ? 'transparent' : 'linear-gradient(135deg,var(--green),var(--blue))',
                overflow: 'hidden', border: '3px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, fontWeight: 900, color: '#fff',
              }}>
                {photo
                  ? <img src={photo} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user.avatar}
              </div>
              {/* Camera button */}
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  position: 'absolute', bottom: -6, right: -6,
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'var(--green)', border: '2px solid var(--bg2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{user.email}</div>
              <span style={{
                display: 'inline-block', marginTop: 8,
                background: 'var(--green-l)', color: 'var(--green)',
                borderRadius: 100, padding: '3px 12px', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
              }}>{roleName}</span>
            </div>

            {photo && (
              <button
                onClick={() => setPhoto(null)}
                style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {lang === 'en' ? 'Remove photo' : 'Kura ifoto'}
              </button>
            )}

            <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.5 }}>
              {lang === 'en' ? 'Click the camera icon to upload your photo. JPG, PNG - max 4MB.' : 'Kanda kamera gushyira ifoto. JPG, PNG - max 4MB.'}
            </p>
          </div>

          {/* Appearance card */}
          <div className="gc" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text2)', marginBottom: 14 }}>
              {lang === 'en' ? 'Appearance' : 'Imiterere'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['light', 'dark'].map(m => (
                <button
                  key={m}
                  onClick={() => setTheme(m)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                    border: theme === m ? '2px solid var(--green)' : '1px solid var(--border)',
                    background: theme === m ? 'var(--green-l)' : 'var(--bg)',
                    color: theme === m ? 'var(--green)' : 'var(--text2)',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: 700, transition: '.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  }}
                >
                  {m === 'light'
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>}
                  {m === 'light' ? (lang === 'en' ? 'Light' : 'Urumuri') : (lang === 'en' ? 'Dark' : 'Icyiza')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Edit forms ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Personal Info */}
          <div className="gc" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              {lang === 'en' ? 'Personal Information' : 'Amakuru Bwite'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="fg" style={{ margin: 0 }}>
                <label className="fl">{t.form.name} *</label>
                <input className="fi" value={form.name} onChange={e => setF('name', e.target.value)} />
                {errors.name && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{errors.name}</p>}
              </div>
              <div className="fg" style={{ margin: 0 }}>
                <label className="fl">{lang === 'en' ? 'Phone Number' : 'Numero ya Telefoni'}</label>
                <input className="fi" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+250 7XX XXX XXX" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <div className="fg" style={{ margin: 0 }}>
                <label className="fl">{t.form.district}</label>
                <select className="fs" value={form.district} onChange={e => { setF('district', e.target.value); setF('sector', ''); }}>
                  <option value="">{lang === 'en' ? 'Select district...' : 'Hitamo akarere...'}</option>
                  {Object.keys(sectorsByDistrict).sort().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="fg" style={{ margin: 0 }}>
                <label className="fl">{t.form.sector} *</label>
                <select className="fs" value={form.sector} onChange={e => setF('sector', e.target.value)}>
                  <option value="">{lang === 'en' ? 'Select sector...' : 'Hitamo akagari...'}</option>
                  {(sectorsByDistrict[form.district] || []).map(s => (
                    <option key={s} value={`${s}, ${form.district}`}>{s}</option>
                  ))}
                </select>
                {errors.sector && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{errors.sector}</p>}
              </div>
            </div>

            {user.role === 'technician' && (
              <div className="fg" style={{ marginTop: 14, marginBottom: 0 }}>
                <label className="fl">{t.form.specialization}</label>
                <select className="fs" value={form.specialization} onChange={e => setF('specialization', e.target.value)}>
                  <option value="">{lang === 'en' ? 'Select specialization...' : 'Hitamo inzobere...'}</option>
                  {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            {user.role === 'recycler' && (
              <div className="fg" style={{ marginTop: 14, marginBottom: 0 }}>
                <label className="fl">{t.form.company}</label>
                <input className="fi" value={form.company} onChange={e => setF('company', e.target.value)} placeholder="Company name" />
              </div>
            )}

            {/* Locked fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <div>
                <label className="fl" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {t.form.email}
                  <span style={{ background: 'var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Locked' : 'Bifunze'}
                  </span>
                </label>
                <input className="fi" value={user.email} disabled style={{ opacity: .5, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label className="fl" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {lang === 'en' ? 'Account Role' : 'Inshingano'}
                  <span style={{ background: 'var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>
                    {lang === 'en' ? 'Locked' : 'Bifunze'}
                  </span>
                </label>
                <input className="fi" value={roleName} disabled style={{ opacity: .5, cursor: 'not-allowed', textTransform: 'capitalize' }} />
              </div>
            </div>

            <button className="btn-p" style={{ marginTop: 20, justifyContent: 'center' }} onClick={handleSave} disabled={saving}>
              {saving ? (lang === 'en' ? 'Saving...' : 'Bivugurura...') : (lang === 'en' ? 'Save Changes' : 'Bika Impinduka')}
            </button>
          </div>

          {/* Change Password */}
          <div className="gc" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              {lang === 'en' ? 'Change Password' : 'Hindura Ijambo Banga'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div className="fg" style={{ margin: 0 }}>
                <label className="fl">{lang === 'en' ? 'Current Password' : 'Ijambo Banga Rya Ubu'}</label>
                <div style={{ position: 'relative' }}>
                  <input className="fi" type={showPw ? 'text' : 'password'} value={pwForm.current} onChange={e => setPF('current', e.target.value)} style={{ paddingRight: 38 }} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)' }}>
                    <EyeIcon />
                  </button>
                </div>
                {pwErrors.current && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{pwErrors.current}</p>}
              </div>
              <div className="fg" style={{ margin: 0 }}>
                <label className="fl">{lang === 'en' ? 'New Password' : 'Ijambo Banga Rishya'}</label>
                <input className="fi" type="password" value={pwForm.newPw} onChange={e => setPF('newPw', e.target.value)} />
                {pwErrors.newPw && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{pwErrors.newPw}</p>}
              </div>
              <div className="fg" style={{ margin: 0 }}>
                <label className="fl">{t.form.confirmPassword}</label>
                <input className="fi" type="password" value={pwForm.confirm} onChange={e => setPF('confirm', e.target.value)} />
                {pwErrors.confirm && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 3 }}>{pwErrors.confirm}</p>}
              </div>
            </div>

            <button className="btn-g" style={{ marginTop: 16, justifyContent: 'center' }} onClick={handlePasswordChange} disabled={saving}>
              {lang === 'en' ? 'Update Password' : 'Vugurura Ijambo Banga'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
