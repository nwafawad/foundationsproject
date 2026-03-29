import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { getNotifications, markAllRead } from '../utils/api';

export default function Navbar({ currentPage, navigate, theme, setTheme }) {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const t = T[lang];
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (user) {
      getNotifications(user.id).then(setNotifs).catch(() => {});
    }
  }, [user, currentPage]);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const navLinks = [
    { key: 'home', label: t.nav.home, page: 'home' },
    { key: 'marketplace', label: t.nav.marketplace, page: 'marketplace' },
    { key: 'technicians', label: t.nav.technicians, page: 'technicians' },
    { key: 'map', label: t.nav.map, page: 'map' },
  ];

  const go = (page) => {
    navigate(page);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDropOpen(false);
    navigate('home');
  };

  const RecycleIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green)' }}>
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
      <path d="m14 16-3 3 3 3" />
      <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
      <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.572.89l3.468 6.004" />
      <path d="m18.186 12.7 1.096 4.096 4.096-1.098" />
    </svg>
  );

  const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );

  const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  const BellIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const ChevronIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-in">
          {/* Logo */}
          <div className="logo" onClick={() => go('home')}>
            <RecycleIcon />
            <span>RECYX</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="nls" style={{ display: window.innerWidth <= 700 ? 'none' : 'flex' }}>
            {navLinks.map(l => (
              <button
                key={l.key}
                className={`nl${currentPage === l.page ? ' act' : ''}`}
                onClick={() => go(l.page)}
              >
                {l.label}
              </button>
            ))}
            {user && (
              <button
                className={`nl${currentPage === 'dashboard' ? ' act' : ''}`}
                onClick={() => go('dashboard')}
              >
                {t.nav.dashboard}
              </button>
            )}
            {user && (
              <button
                className={`nl${currentPage === 'saved' ? ' act' : ''}`}
                onClick={() => go('saved')}
              >
                {lang === 'en' ? 'Saved' : 'Bitswe'}
              </button>
            )}
            {user && user.role === 'admin' && (
              <button
                className={`nl${currentPage === 'admin' ? ' act' : ''}`}
                onClick={() => go('admin')}
              >
                {t.nav.admin}
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="na">
            {/* Lang Toggle */}
            <button
              className="theme-btn"
              onClick={() => setLang(lang === 'en' ? 'rw' : 'en')}
              title="Toggle language"
              style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', gap: 0 }}
            >
              {lang === 'en' ? 'KN' : 'EN'}
            </button>

            {/* Theme Toggle */}
            <button
              className="theme-btn"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Notification Bell */}
            {user && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  className="theme-btn"
                  onClick={() => {
                    setNotifOpen(o => !o);
                    if (!notifOpen && unread > 0) {
                      markAllRead(user.id);
                      setNotifs(n => n.map(x => ({ ...x, read: true })));
                    }
                  }}
                  style={{ position: 'relative' }}
                >
                  <BellIcon />
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4, width: 16, height: 16,
                      borderRadius: '50%', background: 'var(--red)', color: '#fff',
                      fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', border: '2px solid var(--bg)',
                    }}>
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 320, background: 'var(--bg2)', borderRadius: 16,
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                    zIndex: 200, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: 13 }}>
                      Notifications
                    </div>
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                      {notifs.length === 0 ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
                          No notifications
                        </div>
                      ) : notifs.slice(0, 8).map(n => (
                        <div key={n.id} style={{
                          padding: '10px 16px', fontSize: 12, borderBottom: '1px solid var(--border)',
                          background: n.read ? 'transparent' : 'rgba(22,163,74,.04)',
                          cursor: 'pointer',
                        }}>
                          <div style={{ fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>{n.message}</div>
                          <div style={{ color: 'var(--text3)', fontSize: 10, marginTop: 3 }}>{n.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth */}
            {!user ? (
              <>
                <button className="nl" onClick={() => go('login')}>{t.nav.login}</button>
                <button className="nav-cta" onClick={() => go('register')}>{t.nav.register}</button>
              </>
            ) : (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px',
                    borderRadius: 100, background: 'var(--bg2)', border: '1px solid var(--border)',
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--green), var(--blue))',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {user.avatar || user.name?.[0] || 'U'}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronIcon />
                </button>
                {dropOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 200, background: 'var(--bg2)', borderRadius: 14,
                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                    zIndex: 200, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{user.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                    {[
                      { label: t.nav.dashboard, page: 'dashboard' },
                      { label: lang === 'en' ? 'Saved' : 'Bitswe', page: 'saved' },
                      ...(user.role === 'admin' ? [{ label: t.nav.admin, page: 'admin' }] : []),
                      { label: t.nav.marketplace, page: 'marketplace' },
                    ].map(item => (
                      <button key={item.page} onClick={() => { go(item.page); setDropOpen(false); }} style={{
                        width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13,
                        fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text)', fontFamily: 'inherit',
                        borderBottom: '1px solid var(--border)',
                      }}>
                        {item.label}
                      </button>
                    ))}
                    <button onClick={handleLogout} style={{
                      width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 13,
                      fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--red)', fontFamily: 'inherit',
                    }}>
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger */}
            <button
              className="theme-btn"
              onClick={() => setMenuOpen(o => !o)}
              style={{ display: 'none' }}
              id="hamburger"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                  : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                }
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 62, left: 0, right: 0, bottom: 0,
          background: 'var(--glass)', backdropFilter: 'blur(24px)',
          zIndex: 99, padding: 24, display: 'flex', flexDirection: 'column', gap: 4,
          borderTop: '1px solid var(--border)',
        }}>
          {navLinks.map(l => (
            <button key={l.key} className={`nl${currentPage === l.page ? ' act' : ''}`}
              style={{ justifyContent: 'flex-start', padding: '14px 16px', fontSize: 15 }}
              onClick={() => go(l.page)}>
              {l.label}
            </button>
          ))}
          {user && (
            <button className="nl" style={{ justifyContent: 'flex-start', padding: '14px 16px', fontSize: 15 }} onClick={() => go('dashboard')}>
              {t.nav.dashboard}
            </button>
          )}
          {user && (
            <button className="nl" style={{ justifyContent: 'flex-start', padding: '14px 16px', fontSize: 15 }} onClick={() => go('saved')}>
              {lang === 'en' ? 'Saved' : 'Bitswe'}
            </button>
          )}
          {user?.role === 'admin' && (
            <button className="nl" style={{ justifyContent: 'flex-start', padding: '14px 16px', fontSize: 15 }} onClick={() => go('admin')}>
              {t.nav.admin}
            </button>
          )}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!user ? (
              <>
                <button className="btn-g" onClick={() => go('login')}>{t.nav.login}</button>
                <button className="nav-cta" style={{ borderRadius: 12, padding: 14 }} onClick={() => go('register')}>{t.nav.register}</button>
              </>
            ) : (
              <button onClick={handleLogout} style={{
                padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: 'var(--red-l)', color: 'var(--red)', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
                {t.nav.logout}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:700px){
          .nls{display:none!important}
          #hamburger{display:flex!important}
        }
      `}</style>
    </>
  );
}
