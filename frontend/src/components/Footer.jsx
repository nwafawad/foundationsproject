import React from 'react';
import { useLang } from '../context/LangContext';
import T from '../data/translations';

export default function Footer({ navigate }) {
  const { lang } = useLang();
  const t = T[lang];

  const go = (page) => {
    navigate(page);
    window.scrollTo(0, 0);
  };

  const RecycleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green)' }}>
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
      <path d="m14 16-3 3 3 3" />
      <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
      <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.572.89l3.468 6.004" />
      <path d="m18.186 12.7 1.096 4.096 4.096-1.098" />
    </svg>
  );

  const socials = [
    {
      name: 'Twitter / X',
      href: 'https://twitter.com',
      path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
      viewBox: '0 0 24 24',
      type: 'path',
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      type: 'instagram',
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      type: 'linkedin',
    },
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      type: 'facebook',
    },
  ];

  const renderSocialIcon = (s) => {
    if (s.type === 'path') {
      return (
        <svg width="17" height="17" viewBox={s.viewBox} fill="currentColor">
          <path d={s.path} />
        </svg>
      );
    }
    if (s.type === 'instagram') {
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    }
    if (s.type === 'linkedin') {
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    }
    if (s.type === 'facebook') {
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <footer className="footer">
      <div className="footer-g">
        {/* Brand */}
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }} onClick={() => go('home')}>
            <RecycleIcon />
            <span style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg,var(--green),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              RECYX
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 260 }}>
            {t.footer.tagline}
          </p>
          <div className="footer-soc" style={{ marginTop: 16 }}>
            {socials.map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                className="soc-link" title={s.name}>
                {renderSocialIcon(s)}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'rgba(255,255,255,.9)', marginBottom: 14 }}>
            {t.footer.links}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: t.nav.home, page: 'home' },
              { label: t.nav.marketplace, page: 'marketplace' },
              { label: t.nav.technicians, page: 'technicians' },
              { label: t.nav.map, page: 'map' },
              { label: t.footer.about, page: 'about' },
              { label: t.footer.careers, page: 'careers' },
            ].map(l => (
              <button key={l.page} onClick={() => go(l.page)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0', fontSize: 13, color: 'rgba(255,255,255,.55)', textAlign: 'left', transition: 'color .2s, transform .2s', width: '100%' }}
                onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, lineHeight: 1 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'rgba(255,255,255,.9)', marginBottom: 14 }}>
            {t.footer.legal}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: t.footer.privacy, page: 'privacy' },
              { label: t.footer.terms, page: 'terms' },
            ].map(l => (
              <button key={l.page} onClick={() => go(l.page)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0', fontSize: 13, color: 'rgba(255,255,255,.55)', textAlign: 'left', transition: 'color .2s, transform .2s', width: '100%' }}
                onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,.55)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, lineHeight: 1 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'rgba(255,255,255,.9)', marginBottom: 16 }}>
            {t.footer.contact}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>, text: 'info@recyx.rw' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>, text: '+250 788 000 001' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>, text: t.footer.address },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, text: t.footer.hours },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                <span style={{ color: 'var(--green)', marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 1240, margin: '0 auto', padding: '18px 24px 0',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>{t.footer.copyright}</p>
        <p style={{ fontSize: 12, color: 'var(--text3)' }}>
          Built with purpose for Rwanda's circular economy.
        </p>
      </div>
    </footer>
  );
}
