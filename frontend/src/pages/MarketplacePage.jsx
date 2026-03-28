import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { getListings as apiGetListings, getOffers as apiGetOffers, makeOffer as apiMakeOffer, acceptOffer as apiAcceptOffer, declineOffer as apiDeclineOffer, updateListingViews as apiUpdateViews, checkFavorite as apiCheckFavorite, toggleFavorite as apiToggleFavorite } from '../utils/api';
import { MaterialBadge, StatusBadge } from '../components/Badge';
import Stars from '../components/Stars';
import PaymentFlow from '../components/PaymentFlow';
import Toast from '../components/Toast';
import { MATERIAL_COLORS, STATUS_COLORS } from '../data/demoData';

const FILTERS = ['all', 'electronics', 'plastic', 'metal', 'paper', 'glass', 'mixed'];
const SORTS = ['newest', 'priceAsc', 'priceDesc', 'mostViewed'];

export default function MarketplacePage({ navigate }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang];

  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(12);
  const [selected, setSelected] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMsg, setOfferMsg] = useState('');
  const [counterAmt, setCounterAmt] = useState('');
  const [counterMsg, setCounterMsg] = useState('');
  const [counteringId, setCounteringId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    apiGetListings({ status: 'available' })
      .then(data => setListings((data || []).filter(l => l.status === 'available')))
      .catch(() => setListings([]));
  }, []);

  useEffect(() => {
    if (selected) {
      apiGetOffers(selected.id).then(setOffers).catch(() => setOffers([]));
      apiUpdateViews(selected.id);
      setFavCount(selected.favorites || 0);
      if (user) {
        apiCheckFavorite(selected.id).then(setFavorited).catch(() => setFavorited(false));
      } else {
        setFavorited(false);
      }
    }
  }, [selected, user]);

  const handleToggleFavorite = async () => {
    if (!user) { navigate('login'); return; }
    try {
      const res = await apiToggleFavorite(selected.id);
      setFavorited(res.favorited);
      setFavCount(res.favorites);
    } catch (err) {
      // silent fail — count stays as-is
    }
  };

  const filtered = useMemo(() => {
    let res = listings;
    if (filter !== 'all') res = res.filter(l => l.material === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(l => l.title.toLowerCase().includes(q) || l.material.toLowerCase().includes(q) || l.sector.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'priceAsc': return [...res].sort((a, b) => a.price - b.price);
      case 'priceDesc': return [...res].sort((a, b) => b.price - a.price);
      case 'mostViewed': return [...res].sort((a, b) => (b.views || 0) - (a.views || 0));
      default: return [...res].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }, [listings, filter, search, sort]);

  const shown = filtered.slice(0, page);

  const handleMakeOffer = async () => {
    if (!user) { navigate('login'); return; }
    if (!offerAmount || isNaN(offerAmount)) { setToast({ message: t.errors.required, type: 'error' }); return; }
    setLoading(true);
    try {
      const res = await apiMakeOffer({ listingId: selected.id, buyerId: user.id, buyerName: user.name, amount: offerAmount, message: offerMsg });
      setLoading(false);
      if (!res.success) { setToast({ message: res.error, type: 'error' }); return; }
      setToast({ message: t.success.offerMade, type: 'success' });
      const offersData = await apiGetOffers(selected.id);
      setOffers(offersData || []);
      setOfferAmount(''); setOfferMsg('');
    } catch (err) {
      setLoading(false);
      setToast({ message: 'Failed to make offer', type: 'error' });
    }
  };

  const handleAccept = async (offId) => {
    try {
      await apiAcceptOffer(offId);
      setToast({ message: t.success.offerAccepted, type: 'success' });
      const offersData = await apiGetOffers(selected.id);
      setOffers(offersData || []);
      apiGetListings({ status: 'available' })
        .then(data => setListings((data || []).filter(l => l.status === 'available')))
        .catch(() => {});
    } catch (err) {
      setToast({ message: err?.message || 'Failed to accept offer', type: 'error' });
    }
  };

  const handleDecline = async (offId) => {
    try {
      await apiDeclineOffer(offId);
      setToast({ message: t.success.offerDeclined, type: 'info' });
      const offersData = await apiGetOffers(selected.id);
      setOffers(offersData || []);
    } catch (err) {
      setToast({ message: err?.message || 'Failed to decline offer', type: 'error' });
    }
  };

  const handleCounter = (offId) => {
    if (!counterAmt) return;
    // Update local offer state with counter details (UI feedback only)
    setOffers(prev => prev.map(o => o.id === offId
      ? { ...o, status: 'countered', counterAmount: Number(counterAmt), counterMessage: counterMsg }
      : o
    ));
    setToast({ message: t.success.counterSent, type: 'success' });
    setCounteringId(null); setCounterAmt(''); setCounterMsg('');
  };

  const handleAcceptCounter = async (offId) => {
    try {
      await apiAcceptOffer(offId);
      setToast({ message: t.success.offerAccepted, type: 'success' });
      const offersData = await apiGetOffers(selected.id);
      setOffers(offersData || []);
    } catch (err) {
      setToast({ message: err?.message || 'Failed to accept offer', type: 'error' });
    }
  };

  const isSeller = selected && user && selected.sellerId === user.id;

  const EyeIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
  const HeartIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
  const PinIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;

  if (selected) {
    const sellerOffers = offers.filter(o => !['declined'].includes(o.status));
    const myOffer = user ? offers.find(o => o.buyerId === user.id) : null;
    const acceptedOffer = offers.find(o => o.status === 'accepted');

    return (
      <div className="pg pi">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <button className="btn-back" onClick={() => setSelected(null)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          {t.btn.back}
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, marginTop: 20, alignItems: 'start' }}>
          <div>
            {/* Hero image */}
            <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20, height: 340, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={selected.image} alt={selected.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            {/* Details */}
            <div className="gc" style={{ padding: '22px 24px', marginBottom: 18 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <MaterialBadge material={selected.material} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--bg)', borderRadius: 100, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: 'var(--text2)', textTransform: 'capitalize' }}>
                  {selected.condition}
                </span>
                <StatusBadge status={selected.status} />
              </div>

              <h1 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 900, letterSpacing: '-.5px', marginBottom: 10 }}>
                {selected.title}
              </h1>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--green)', marginBottom: 16 }}>
                {selected.price.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>RWF</span>
              </div>

              <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 18 }}>{selected.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: t.market.detail.quantity, val: `${selected.qty} kg` },
                  { label: t.market.detail.sector, val: selected.sector },
                  { label: t.market.detail.listed, val: selected.date },
                  { label: t.market.detail.views, val: `${selected.views || 0} views` },
                ].map((x, i) => (
                  <div key={i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{x.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{x.val}</div>
                  </div>
                ))}
              </div>

              {/* Heart / favorite button */}
              <div style={{ marginTop: 14 }}>
                <button
                  onClick={handleToggleFavorite}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: favorited ? 'rgba(239,68,68,.1)' : 'var(--bg)',
                    border: `1.5px solid ${favorited ? '#ef4444' : 'var(--border)'}`,
                    borderRadius: 100, padding: '7px 16px', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600,
                    color: favorited ? '#ef4444' : 'var(--text2)',
                    transition: 'all .2s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={favorited ? '#ef4444' : 'none'} stroke={favorited ? '#ef4444' : 'currentColor'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {favCount} {lang === 'en' ? (favorited ? 'Saved' : 'Save') : (favorited ? 'Byabitswe' : 'Bika')}
                </button>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div>
            {/* Make offer (if not seller, not already offered, status available) */}
            {!isSeller && selected.status === 'available' && (
              <div className="gc" style={{ padding: 20, marginBottom: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>{t.market.detail.makeOffer}</h3>
                {!user ? (
                  <button className="btn-p" style={{ width: '100%' }} onClick={() => navigate('login')}>
                    {t.market.detail.loginToOffer}
                  </button>
                ) : myOffer && !['declined'].includes(myOffer.status) ? (
                  <div>
                    <div className="al-i" style={{ borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 10 }}>
                      {lang === 'en' ? `Your current offer: ${myOffer.amount.toLocaleString()} RWF` : `Igiciro cyawe: ${myOffer.amount.toLocaleString()} RWF`}
                      <div style={{ marginTop: 4 }}><StatusBadge status={myOffer.status} /></div>
                    </div>
                    {myOffer.status === 'countered' && (
                      <div>
                        <div className="al-w" style={{ borderRadius: 10, padding: '10px 14px', fontSize: 12, marginBottom: 12 }}>
                          <strong>{lang === 'en' ? 'Counter offer:' : 'Igiciro gishya:'}</strong> {myOffer.counterAmount?.toLocaleString()} RWF<br />
                          {myOffer.counterMessage}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-acc" style={{ flex: 1 }} onClick={() => handleAcceptCounter(myOffer.id)}>
                            {lang === 'en' ? 'Accept Counter' : 'Emera Igiciro'}
                          </button>
                          <button className="btn-ctr" style={{ flex: 1 }} onClick={() => setCounteringId(myOffer.id)}>
                            {lang === 'en' ? 'Re-counter' : 'Subiramo'}
                          </button>
                        </div>
                      </div>
                    )}
                    {myOffer.status === 'accepted' && (
                      <PaymentFlow offer={myOffer} listing={selected} isSeller={false} onUpdate={() => apiGetOffers(selected.id).then(d => setOffers(d || []))} />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="fg">
                      <label className="fl">{t.market.detail.yourOffer}</label>
                      <input className="fi" type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} placeholder="50000" />
                    </div>
                    <div className="fg">
                      <label className="fl">{t.market.detail.offerMsg}</label>
                      <textarea className="fi" rows={3} value={offerMsg} onChange={e => setOfferMsg(e.target.value)} placeholder={lang === 'en' ? 'Add a note for the seller...' : 'Ongeraho ubutumwa ku mucuruzi...'} style={{ resize: 'vertical' }} />
                    </div>
                    <button className="btn-p" style={{ width: '100%' }} onClick={handleMakeOffer} disabled={loading}>
                      {loading ? '...' : t.btn.makeOffer}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Seller payment flow for accepted offer */}
            {isSeller && acceptedOffer && (
              <PaymentFlow offer={acceptedOffer} listing={selected} isSeller={true} onUpdate={() => apiGetOffers(selected.id).then(d => setOffers(d || []))} />
            )}

            {/* Offers list */}
            <div className="gc" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>
                {t.market.detail.offers} ({sellerOffers.length})
              </h3>
              {sellerOffers.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>{t.market.detail.noOffers}</p>
              ) : sellerOffers.map(o => {
                const isMine = user && o.buyerId === user.id;
                const canManage = isSeller && ['pending', 'countered'].includes(o.status);

                return (
                  <div key={o.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{o.buyerName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--green)' }}>{o.amount.toLocaleString()} RWF</div>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                    {o.message && <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>{o.message}</p>}
                    {o.status === 'countered' && (
                      <div className="al-w" style={{ borderRadius: 8, padding: '8px 12px', fontSize: 12, marginBottom: 8 }}>
                        {lang === 'en' ? 'Counter:' : 'Igiciro gishya:'} {o.counterAmount?.toLocaleString()} RWF - {o.counterMessage}
                      </div>
                    )}

                    {/* Seller actions */}
                    {canManage && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {o.status === 'pending' && (
                          <>
                            <button className="btn-acc" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => handleAccept(o.id)}>{t.btn.accept}</button>
                            <button className="btn-ctr" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => setCounteringId(o.id)}>{t.btn.counter}</button>
                            <button className="btn-dec" style={{ fontSize: 11, padding: '5px 12px' }} onClick={() => handleDecline(o.id)}>{t.btn.decline}</button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Counter input */}
                    {counteringId === o.id && (
                      <div style={{ marginTop: 10 }}>
                        <div className="fg" style={{ marginBottom: 8 }}>
                          <label className="fl" style={{ fontSize: 11 }}>{lang === 'en' ? 'Counter amount (RWF)' : 'Igiciro gishya (RWF)'}</label>
                          <input className="fi" type="number" value={counterAmt} onChange={e => setCounterAmt(e.target.value)} placeholder={selected.price.toString()} style={{ padding: '8px 12px' }} />
                        </div>
                        <div className="fg" style={{ marginBottom: 8 }}>
                          <label className="fl" style={{ fontSize: 11 }}>{t.form.message}</label>
                          <input className="fi" value={counterMsg} onChange={e => setCounterMsg(e.target.value)} placeholder={lang === 'en' ? 'Reason for counter...' : 'Impamvu...'} style={{ padding: '8px 12px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-ctr" style={{ flex: 1, fontSize: 12 }} onClick={() => handleCounter(o.id)}>{t.btn.submit}</button>
                          <button className="btn-g" style={{ flex: 1, fontSize: 12 }} onClick={() => setCounteringId(null)}>{t.btn.cancel}</button>
                        </div>
                      </div>
                    )}

                    {/* Payment for accepted offer (seller) */}
                    {isSeller && o.status === 'accepted' && (
                      <PaymentFlow offer={o} listing={selected} isSeller={true} onUpdate={() => apiGetOffers(selected.id).then(d => setOffers(d || []))} />
                    )}
                    {isMine && o.status === 'accepted' && (
                      <PaymentFlow offer={o} listing={selected} isSeller={false} onUpdate={() => apiGetOffers(selected.id).then(d => setOffers(d || []))} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pg pi">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="pg-h">
        <h1 className="pg-t">{t.market.heading}</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6 }}>{t.market.sub}</p>
      </div>

      {/* Filter Bar */}
      <div className="fb" style={{ flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
          <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              placeholder={lang === 'en' ? 'Search listings...' : 'Shakisha amatangazo...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="fsl" value={sort} onChange={e => setSort(e.target.value)}>
            {SORTS.map(s => <option key={s} value={s}>{t.market.sort[s]}</option>)}
          </select>
          {user && (
            <button className="btn-p" style={{ flexShrink: 0 }} onClick={() => navigate('create-listing')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              {t.nav.createListing}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {t.market.filters[f]}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
        {filtered.length} {lang === 'en' ? 'listings found' : 'amatangazo yabonetse'}
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text2)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 14px', display: 'block', opacity: 0.3 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {t.market.noResults}
        </div>
      ) : (
        <>
          <div className="lg">
            {shown.map(l => (
              <ListingCard key={l.id} listing={l} onClick={() => setSelected(l)} t={t} lang={lang} />
            ))}
          </div>
          {page < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button className="btn-g" onClick={() => setPage(p => p + 8)}>
                {t.btn.loadMore} ({filtered.length - page} {lang === 'en' ? 'more' : 'birenzeho'})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListingCard({ listing: l, onClick, t, lang }) {
  const [hovered, setHovered] = useState(false);
  const [bg, color] = MATERIAL_COLORS[l.material] || ['#f3f4f6', '#6b7280'];

  return (
    <div className="lc" style={{
      transform: hovered ? 'translateY(-4px)' : 'none',
      boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow)',
      transition: 'all .3s',
      cursor: 'pointer',
    }}
      onClick={onClick}
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
          <span style={{ background: bg, color, borderRadius: 100, padding: '3px 10px', fontSize: 10, fontWeight: 700, textTransform: 'capitalize' }}>{l.material}</span>
        </div>
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ background: 'rgba(255,255,255,.95)', borderRadius: 100, padding: '8px 20px', fontSize: 12, fontWeight: 700, color: '#111' }}>
              {t.btn.viewDetails}
            </span>
          </div>
        )}
      </div>
      <div className="lc-body">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'capitalize', background: 'var(--bg)', borderRadius: 6, padding: '2px 8px' }}>{l.condition}</span>
        </div>
        <div className="lc-tit">{l.title}</div>
        {l.sellerName && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
            {lang === 'en' ? 'By' : 'Na'} {l.sellerName}
          </div>
        )}
        <div className="lc-pr">{l.price.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)' }}>RWF</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text3)' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {l.sector?.split(',')[0]}
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text2)', fontWeight: 600 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              {(l.views || 0).toLocaleString()} views
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text3)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              {l.favorites || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
