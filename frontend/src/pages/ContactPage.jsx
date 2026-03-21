import React, { useState } from 'react';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import Toast from '../components/Toast';

export default function ContactPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setToast({ message: t.success.messageSent, type: 'success' });
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  const contacts = [
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>, label: lang === 'en' ? 'Email Us' : 'Tutwandikire', value: 'info@recyx.rw', color: '#0ea5e9', bg: '#e0f2fe' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>, label: lang === 'en' ? 'Call Us' : 'Tuhamagare', value: '+250 788 000 001', color: '#16a34a', bg: '#dcfce7' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, label: lang === 'en' ? 'Visit Us' : 'Tureba', value: 'African Leadership University, Kigali Innovation City, Kigali', color: '#7c3aed', bg: '#ede9fe' },
    { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, label: lang === 'en' ? 'Office Hours' : 'Amasaha y\'Akazi', value: t.footer.hours, color: '#f59e0b', bg: '#fef3c7' },
  ];

  return (
    <div className="pg pi content-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="pg-h">
        <h1 className="pg-t">{t.pages.contact}</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6 }}>
          {lang === 'en' ? 'Have a question or want to partner with us? We\'d love to hear from you.' : 'Ufite ikibazo cyangwa ushaka gukorana natwe? Twishimira kukuvugana.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 28, alignItems: 'start' }}>
        {/* Contact Form */}
        <div className="gc" style={{ padding: '28px 30px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
            {lang === 'en' ? 'Send Us a Message' : 'Duhereze Ubutumwa'}
          </h2>
          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fg">
                <label className="fl">{t.form.name}</label>
                <input className="fi" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Pacifique Mugabo" />
              </div>
              <div className="fg">
                <label className="fl">{t.form.email}</label>
                <input className="fi" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              </div>
            </div>
            <div className="fg">
              <label className="fl">{t.form.subject}</label>
              <input className="fi" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder={lang === 'en' ? 'How can we help?' : 'Twagufashije iki?'} />
            </div>
            <div className="fg">
              <label className="fl">{t.form.message}</label>
              <textarea className="fi" rows={5} value={form.message} onChange={e => set('message', e.target.value)} placeholder={lang === 'en' ? 'Write your message here...' : 'Andika ubutumwa bwawe hano...'} style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-p" style={{ width: '100%' }} disabled={loading}>
              {loading ? '...' : t.btn.sendMessage}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {contacts.map((c, i) => (
            <div key={i} className="contact-item gc" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>{c.value}</div>
              </div>
            </div>
          ))}

          <div className="gc" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              {lang === 'en' ? 'Follow Us' : 'Dusubirwaho'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { href: 'https://twitter.com', label: 'Twitter', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                { href: 'https://instagram.com', label: 'Instagram', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
                { href: 'https://linkedin.com', label: 'LinkedIn', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg> },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{
                    width: 38, height: 38, borderRadius: 10, background: 'var(--bg)',
                    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text2)', transition: '.2s', textDecoration: 'none',
                  }}
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--green)'; e.currentTarget.style.borderColor = 'var(--green)'; }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}