import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { getPublishedTestimonials } from '../utils/mockService';
import Stars from '../components/Stars';

function useCountUp(target, start = false, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1400&h=700&fit=crop',
    key: 'slide1',
  },
  {
    img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&h=700&fit=crop',
    key: 'slide2',
  },
  {
    img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1400&h=700&fit=crop',
    key: 'slide3',
  },
];

const STATS_DATA = [
  { target: 2500, suffix: '+', label: 'repairs', icon: 'wrench', color: '#16a34a', bg: '#dcfce7' },
  { target: 850, suffix: '+', label: 'listings', icon: 'pkg', color: '#0ea5e9', bg: '#e0f2fe' },
  { target: 45, suffix: '+', label: 'centers', icon: 'recycle', color: '#7c3aed', bg: '#ede9fe' },
  { target: 30, suffix: '', label: 'districts', icon: 'pin', color: '#f59e0b', bg: '#fef3c7' },
];

const FEATURES_DATA = [
  { icon: 'wrench', key: 'repair', color: '#16a34a', bg: '#dcfce7' },
  { icon: 'pkg', key: 'marketplace', color: '#0ea5e9', bg: '#e0f2fe' },
  { icon: 'recycle', key: 'network', color: '#7c3aed', bg: '#ede9fe' },
  { icon: 'pin', key: 'map', color: '#f59e0b', bg: '#fef3c7' },
  { icon: 'star', key: 'ratings', color: '#ec4899', bg: '#fce7f3' },
  { icon: 'shield', key: 'payments', color: '#ef4444', bg: '#fee2e2' },
];

function Icon({ name, size = 22 }) {
  const icons = {
    wrench: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
    pkg: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></svg>,
    recycle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" /><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" /><path d="m14 16-3 3 3 3" /><path d="M8.293 13.596 7.196 9.5 3.1 10.598" /><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.572.89l3.468 6.004" /><path d="m18.186 12.7 1.096 4.096 4.096-1.098" /></svg>,
    pin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    msg: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
  };
  return icons[name] || null;
}

export default function HomePage({ navigate }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang];
  const [slide, setSlide] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const statsRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => { setTestimonials(getPublishedTestimonials()); }, []);

  // Slideshow auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goSlide = (idx) => {
    setSlide(idx);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000);
  };

  // Stats intersection observer
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const slideKeys = ['slide1', 'slide2', 'slide3'];
  const currentSlide = t.hero[slideKeys[slide]];

  return (
    <div className="pi">
      {/* ── Hero Slideshow ── */}
      <div className="hero-wrap">
        {SLIDES.map((s, i) => (
          <div key={i} className={`hero-slide${slide === i ? ' active' : ''}`}>
            <img
              src={s.img}
              alt={`RECYX slide ${i + 1}`}
              className="hero-img"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="hero-ov" />
          </div>
        ))}

        <div className="hero-ct">
          <div className="hero-pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {currentSlide.badge}
          </div>
          <h1 className="hero-h">{currentSlide.headline}</h1>
          <p className="hero-p">{currentSlide.sub}</p>
          <div className="hero-acts">
            <button className="btn-hero" onClick={() => navigate(slide === 1 ? 'technicians' : slide === 2 ? 'create-listing' : 'marketplace')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
              {currentSlide.cta1}
            </button>
            <button className="btn-hero-o" onClick={() => navigate(slide === 2 ? 'map' : 'about')}>
              {currentSlide.cta2}
            </button>
          </div>
        </div>

        {/* Arrows */}
        <button className="hero-nav hero-prev" onClick={() => goSlide((slide - 1 + SLIDES.length) % SLIDES.length)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <button className="hero-nav hero-next" onClick={() => goSlide((slide + 1) % SLIDES.length)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        {/* Dots */}
        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`hero-dot${slide === i ? ' active' : ''}`} onClick={() => goSlide(i)} />
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div ref={statsRef} className="stats-row">
        {STATS_DATA.map((s, i) => (
          <StatCard key={i} {...s} lang={lang} t={t} visible={statsVisible} delay={i * 150} />
        ))}
      </div>

      {/* ── Features ── */}
      <div className="section">
        <h2 className="sec-h">{t.features.heading}</h2>
        <p className="sec-sub">{t.features.sub}</p>
        <div className="feat-grid">
          {FEATURES_DATA.map((f, i) => (
            <div key={i} className="feat-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="feat-icon" style={{ background: f.bg, color: f.color, marginBottom: 16 }}>
                <Icon name={f.icon} size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t.features[f.key].title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{t.features[f.key].desc}</p>
              <div className="feat-arrow" style={{ position: 'absolute', bottom: 20, right: 20, opacity: 0, transform: 'translateX(-6px)', transition: '.3s', color: f.color }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(22,163,74,.04), rgba(14,165,233,.04))', padding: '60px 0' }}>
        <div className="section" style={{ padding: '0 24px' }}>
          <h2 className="sec-h">{t.howItWorks.heading}</h2>
          <p className="sec-sub">{t.howItWorks.sub}</p>
          <div className="how-grid">
            {t.howItWorks.steps.map((step, i) => (
              <div key={i} className="how-card">
                <div className="how-num">{step.num}</div>
                <div className="how-icon">
                  <Icon name={['user', 'pkg', 'msg', 'check'][i]} size={24} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '12px 0 8px' }}>{step.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="section">
        <h2 className="sec-h">{t.testimonials.heading}</h2>
        <p className="sec-sub">{t.testimonials.sub}</p>
        <div className="test-grid">
          {testimonials.map((t2, i) => (
            <div key={i} className="test-card">
              <div className="test-quote">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.12 }}>
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                </svg>
              </div>
              <p className="test-text">{t2.text}</p>
              <div className="test-author">
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--green), var(--blue))',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t2.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t2.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{t2.role}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <Stars rating={t2.rating} size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="cta-bar">
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', padding: '0 24px' }}>
          <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 12, color: '#fff' }}>
            {t.cta.heading}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.85)', marginBottom: 28, lineHeight: 1.6 }}>
            {t.cta.sub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-hero" onClick={() => navigate(user ? 'dashboard' : 'register')}>
              {user ? (lang === 'en' ? 'Go to Dashboard' : 'Injira mu Dashboard') : t.cta.btn1}
            </button>
            <button className="btn-hero-o" onClick={() => navigate(user ? 'marketplace' : 'login')}>
              {user ? t.cta.btn2 : (lang === 'en' ? 'Log In' : 'Injira')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ target, suffix, label, icon, color, bg, t, visible, delay }) {
  const count = useCountUp(target, visible, 1800);
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();

  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon" style={{ background: bg, color }}>
        <Icon name={icon} size={22} />
      </div>
      <div className="stat-n">
        {formatted}{suffix}
      </div>
      <div className="stat-l">{t.stats[label]}</div>
    </div>
  );
}
