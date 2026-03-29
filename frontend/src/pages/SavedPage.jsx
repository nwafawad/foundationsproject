import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { getFavorites, toggleFavorite as apiToggleFavorite } from '../utils/api';
import { MATERIAL_COLORS } from '../data/demoData';

export default function SavedPage({ navigate }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang];

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('login'); return; }
    getFavorites()
      .then(data => { setListings(data || []); setLoading(false); })
      .catch(() => { setListings([]); setLoading(false); });
  }, [user]);

  const handleUnlike = async (listingId) => {
    try {
      await apiToggleFavorite(listingId);
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      // silent fail
    }
  };

  if (loading) {
    return (
      <div className="pg pi" style={{ textAlign: 'center', paddingTop: 80 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"
          style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}>
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="pg pi">
      <div className="pg-h">
        <h1 className="pg-t">{lang === 'en' ? 'Saved Items' : 'Ibyabitswe'}</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6 }}>
          {lang === 'en' ? 'Listings you have saved' : 'Amatangazo wabitsye'}
        </p>
      </div>

      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text2)' }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ margin: '0 auto 16px', display: 'block', opacity: 0.25 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            {lang === 'en' ? 'No saved items yet' : 'Nta kintu nabitswe'}
          </p>
          <p style={{ fontSize: 13, marginBottom: 20 }}>
            {lang === 'en' ? 'Like listings in the marketplace to save them here.' : 'Kunda amatangazo kugirango aboneke hano.'}
          </p>
          <button className="btn-p" onClick={() => navigate('marketplace')}>
            {lang === 'en' ? 'Browse Marketplace' : 'Reba Isoko'}
          </button>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
            {listings.length} {lang === 'en' ? 'saved listing' + (listings.length !== 1 ? 's' : '') : 'amatangazo'}
          </p>
          <div className="lg">
            {listings.map(l => (
              <SavedCard
                key={l.id}
                listing={l}
                lang={lang}
                t={t}
                onUnlike={() => handleUnlike(l.id)}
                onView={() => navigate('marketplace')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SavedCard({ listing: l, lang, t, onUnlike, onView }) {
  const [hovered, setHovered] = useState(false);
  const [bg, color] = MATERIAL_COLORS[l.material] || ['#f3f4f6', '#6b7280'];

  return (
    <div
      className="lc"
      style={{
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow)',
        transition: 'all .3s',
        cursor: 'pointer',
      }}
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="lc-img" style={{ position: 'relative', overflow: 'hidden', height: 200, background: 'var(--bg2)' }}>
        <img
          src={l.image}
          alt={l.title}
          style={{
            width: '100%', height: '100%', objectFit: 'contain',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform .4s ease',
          }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{ background: bg, color, borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 700, textTransform: 'capitalize' }}>
            {l.material}
          </span>
        </div>
        {/* Unlike button */}
        <button
          onClick={e => { e.stopPropagation(); onUnlike(); }}
          title={lang === 'en' ? 'Remove from saved' : 'Kuraho mu bitswe'}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(239,68,68,.15)', border: '1.5px solid #ef4444',
            borderRadius: '50%', width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background .2s',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="lc-body">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'capitalize', background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>
            {l.condition}
          </span>
        </div>
        <div className="lc-tit">{l.title}</div>
        <div className="lc-pr">
          {(l.price || 0).toLocaleString()} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)' }}>RWF</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text3)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {l.sector?.split(',')[0]}
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text2)', fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              {(l.views || 0).toLocaleString()} views
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#ef4444' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {l.favorites || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
