import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { getMyListings, getNotifications, getServiceRequests, markRead, getMyTransactions, submitReview, submitFeedback, getFavorites, updateServiceRequest } from '../utils/api';
import { StatusBadge } from '../components/Badge';
import Stars from '../components/Stars';
import Toast from '../components/Toast';

function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="dash-stat gc">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-1px', color: 'var(--text)' }}>{value}</div>
    </div>
  );
}

function QuickAction({ label, icon, color, bg, onClick }) {
  return (
    <button onClick={onClick} className="dc" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '18px 12px', textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', transition: '.2s', width: '100%' }}
      onMouseOver={e => e.currentTarget.style.borderColor = color}
      onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const ShopIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
const WrenchIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
const MapIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const StarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const BarIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const AdminIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;

export default function DashboardPage({ navigate }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang];

  const [listings, setListings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [serviceReqs, setServiceReqs] = useState([]);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [reviewModal, setReviewModal] = useState(null); // { listingId, listingTitle }
  const [reviewForm, setReviewForm] = useState({ rating: 5, message: '' });
  const [reviewSent, setReviewSent] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ category: 'general', message: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) return;
    getMyListings().then(setListings).catch(() => {});
    getMyTransactions().then(setOffers).catch(() => {});
    getNotifications(user.id).then(setNotifs).catch(() => {});
    getServiceRequests(user.id, user.role).then(setServiceReqs).catch(() => {});
    getFavorites().then(data => setSavedCount((data || []).length)).catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="pg pi" style={{ textAlign: 'center', paddingTop: 80 }}>
        <h2>{lang === 'en' ? 'Please log in to view your dashboard' : 'Injira kugirango urebe imbaho yawe'}</h2>
        <button className="btn-p" style={{ marginTop: 20 }} onClick={() => navigate('login')}>
          {t.btn.login}
        </button>
      </div>
    );
  }

  if (!user.verified && ['technician', 'recycler'].includes(user.role)) {
    return (
      <div className="pg pi" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--amber-l)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <h2 style={{ marginBottom: 10 }}>{lang === 'en' ? 'Account Pending Approval' : 'Konti Irategererwa Kwemezwa'}</h2>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>{t.register.pendingDesc}</p>
        <button className="btn-g" style={{ marginTop: 20 }} onClick={() => navigate('home')}>{t.btn.back}</button>
      </div>
    );
  }

  const myListings = listings;
  const myOffersMade = offers.filter(o => o.buyerId === user.id);
  const offersReceived = offers.filter(o => myListings.some(l => l.id === o.listingId));
  const unreadNotifs = notifs.filter(n => !n.read).length;

  const roleName = t.roles[user.role] || user.role;

  // Admin redirect hint
  if (user.role === 'admin') {
    return (
      <div className="pg pi">
        <div className="dash-grid">
          <div className="dash-main">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, overflow: 'hidden', flexShrink: 0,
                background: 'linear-gradient(135deg,var(--green),var(--blue))', color: '#fff',
                fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--border)',
              }}>
                {user.profilePhoto
                  ? <img src={user.profilePhoto} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user.avatar}
              </div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 900 }}>{t.dash.welcome}, {user.name.split(' ')[0]}</h1>
                <p style={{ fontSize: 13, color: 'var(--text2)', textTransform: 'capitalize' }}>{roleName}</p>
              </div>
              <button onClick={() => navigate('profile')} style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: 10, padding: '7px 14px',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, color: 'var(--text)',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                {lang === 'en' ? 'Edit Profile' : 'Hindura Umwirondoro'}
              </button>
            </div>

            <div className="dash-stats" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              <StatCard label={t.dash.pendingUsers} value={3} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>} color="#f59e0b" bg="#fef3c7" />
              <StatCard label={t.dash.pendingListings} value={1} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>} color="#ef4444" bg="#fee2e2" />
              <StatCard label={t.dash.activeTx} value={2} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>} color="#0ea5e9" bg="#e0f2fe" />
              <StatCard label={t.dash.totalUsers} value={8} icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} color="#7c3aed" bg="#ede9fe" />
            </div>

            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{t.dash.quickActions}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                <QuickAction label={lang === 'en' ? 'Review Accounts' : 'Reba Konti'} icon={<AdminIcon />} color="#f59e0b" bg="#fef3c7" onClick={() => navigate('admin')} />
                <QuickAction label={lang === 'en' ? 'Review Listings' : 'Reba Amatangazo'} icon={<ShopIcon />} color="#ef4444" bg="#fee2e2" onClick={() => navigate('admin')} />
                <QuickAction label={lang === 'en' ? 'Transactions' : 'Ubucuruzi'} icon={<BarIcon />} color="#0ea5e9" bg="#e0f2fe" onClick={() => navigate('admin')} />
              </div>
            </div>

            <div className="al-i" style={{ marginTop: 24, borderRadius: 14, padding: '14px 18px' }}>
              <strong>{lang === 'en' ? 'Admin Panel' : 'Imbaho y\'Ubutegetsi'}</strong> - {lang === 'en' ? 'Click below to manage all platform activities.' : 'Kanda hasi kugirango ugenzure ibikorwa byose.'}
              <div style={{ marginTop: 10 }}>
                <button className="btn-p" onClick={() => navigate('admin')}>
                  {lang === 'en' ? 'Open Admin Panel' : 'Fungura Imbaho y\'Ubutegetsi'}
                </button>
              </div>
            </div>
          </div>

          <div className="dash-side">
            <NotifPanel notifs={notifs} lang={lang} onMark={id => { markRead(id); setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x)); }} t={t} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pg pi">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="dash-grid">
        <div className="dash-main">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, overflow: 'hidden', flexShrink: 0,
              background: 'linear-gradient(135deg,var(--green),var(--blue))', color: '#fff',
              fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--border)',
            }}>
              {user.profilePhoto
                ? <img src={user.profilePhoto} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : user.avatar}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900 }}>{t.dash.welcome}, {user.name.split(' ')[0]}</h1>
              <p style={{ fontSize: 13, color: 'var(--text2)', textTransform: 'capitalize' }}>{roleName}</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => navigate('profile')} style={{
                display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg2)',
                border: '1px solid var(--border)', borderRadius: 10, padding: '7px 14px',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                color: 'var(--text)', transition: '.2s',
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--green)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                {lang === 'en' ? 'Edit Profile' : 'Hindura Umwirondoro'}
              </button>
            {unreadNotifs > 0 && (
              <div style={{ background: 'var(--red)', color: '#fff', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                {unreadNotifs} {lang === 'en' ? 'new' : 'bishya'}
              </div>
            )}
            </div>
          </div>

          {/* Stats */}
          <div className="dash-stats">
            {user.role === 'citizen' && <>
              <StatCard label={t.dash.activeListings} value={myListings.filter(l => l.status === 'available').length} icon={<PlusIcon />} color="#16a34a" bg="#dcfce7" />
              <StatCard label={t.dash.receivedOffers} value={offersReceived.length} icon={<ShopIcon />} color="#0ea5e9" bg="#e0f2fe" />
              <StatCard label={t.dash.completedTx} value={offersReceived.filter(o => o.txStatus === 'completed').length} icon={<CheckIcon />} color="#7c3aed" bg="#ede9fe" />
            </>}
            {user.role === 'buyer' && <>
              <StatCard label={t.dash.activeOffers} value={myOffersMade.filter(o => ['pending', 'countered'].includes(o.status)).length} icon={<ShopIcon />} color="#0ea5e9" bg="#e0f2fe" />
              <StatCard label={lang === 'en' ? 'Won Auctions' : 'Byatsinzwe'} value={myOffersMade.filter(o => o.status === 'accepted').length} icon={<CheckIcon />} color="#16a34a" bg="#dcfce7" />
              <StatCard label={t.dash.savedItems} value={savedCount} icon={<StarIcon />} color="#f59e0b" bg="#fef3c7" />
            </>}
            {user.role === 'technician' && <>
              <StatCard label={t.dash.jobsCompleted} value={user.jobs || 0} icon={<WrenchIcon />} color="#16a34a" bg="#dcfce7" />
              <StatCard label={t.dash.activeRequests} value={serviceReqs.filter(r => r.status === 'pending').length} icon={<BellIcon />} color="#0ea5e9" bg="#e0f2fe" />
              <StatCard label={t.dash.rating} value={`${user.rating || 'N/A'}`} icon={<StarIcon />} color="#f59e0b" bg="#fef3c7" />
              <StatCard label={t.dash.earnings} value={'-'} icon={<BarIcon />} color="#7c3aed" bg="#ede9fe" />
            </>}
            {user.role === 'recycler' && <>
              <StatCard label={t.dash.activeOffers} value={myOffersMade.filter(o => ['pending', 'countered'].includes(o.status)).length} icon={<ShopIcon />} color="#0ea5e9" bg="#e0f2fe" />
              <StatCard label={t.dash.materialsAcquired} value={'-'} icon={<PlusIcon />} color="#16a34a" bg="#dcfce7" />
              <StatCard label={t.dash.co2Saved} value={'-'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 15a4 4 0 0 0 4 4h9a5 5 0 1 0-.1-9.999 5.002 5.002 0 0 0-9.78 2.096A4.001 4.001 0 0 0 3 15z" /></svg>} color="#7c3aed" bg="#ede9fe" />
            </>}
          </div>

          {/* Quick Actions */}
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{t.dash.quickActions}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {user.role === 'citizen' && <>
                <QuickAction label={t.btn.createListing} icon={<PlusIcon />} color="#16a34a" bg="#dcfce7" onClick={() => navigate('create-listing')} />
                <QuickAction label={t.nav.marketplace} icon={<ShopIcon />} color="#0ea5e9" bg="#e0f2fe" onClick={() => navigate('marketplace')} />
                <QuickAction label={lang === 'en' ? 'Technicians' : 'Abatekinsiye'} icon={<WrenchIcon />} color="#7c3aed" bg="#ede9fe" onClick={() => navigate('technicians')} />
                <QuickAction label={t.nav.map} icon={<MapIcon />} color="#f59e0b" bg="#fef3c7" onClick={() => navigate('map')} />
              </>}
              {user.role === 'buyer' && <>
                <QuickAction label={t.nav.marketplace} icon={<ShopIcon />} color="#0ea5e9" bg="#e0f2fe" onClick={() => navigate('marketplace')} />
                <QuickAction label={lang === 'en' ? 'My Offers' : 'Ibiciro Byanjye'} icon={<CheckIcon />} color="#16a34a" bg="#dcfce7" onClick={() => navigate('marketplace')} />
                <QuickAction label={lang === 'en' ? 'Find Technician' : 'Shakisha Umutekinsiye'} icon={<WrenchIcon />} color="#7c3aed" bg="#ede9fe" onClick={() => navigate('technicians')} />
                <QuickAction label={t.nav.map} icon={<MapIcon />} color="#f59e0b" bg="#fef3c7" onClick={() => navigate('map')} />
              </>}
              {user.role === 'technician' && <>
                <QuickAction label={lang === 'en' ? 'Service Requests' : 'Ibyifuzo'} icon={<WrenchIcon />} color="#16a34a" bg="#dcfce7" onClick={() => {}} />
                <QuickAction label={lang === 'en' ? 'My Profile' : 'Umwirondoro Wanjye'} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>} color="#0ea5e9" bg="#e0f2fe" onClick={() => {}} />
                <QuickAction label={lang === 'en' ? 'Reviews' : 'Ibitekerezo'} icon={<StarIcon />} color="#f59e0b" bg="#fef3c7" onClick={() => {}} />
              </>}
              {user.role === 'recycler' && <>
                <QuickAction label={lang === 'en' ? 'Browse Materials' : 'Reba Ibikoresho'} icon={<ShopIcon />} color="#16a34a" bg="#dcfce7" onClick={() => navigate('marketplace')} />
                <QuickAction label={lang === 'en' ? 'My Offers' : 'Ibiciro Byanjye'} icon={<CheckIcon />} color="#0ea5e9" bg="#e0f2fe" onClick={() => navigate('marketplace')} />
                <QuickAction label={lang === 'en' ? 'Analytics' : 'Imibare'} icon={<BarIcon />} color="#7c3aed" bg="#ede9fe" onClick={() => {}} />
              </>}
            </div>
          </div>

          {/* My Listings (citizen/recycler) */}
          {(user.role === 'citizen') && myListings.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>{t.dash.myListings}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myListings.slice(0, 5).map(l => {
                  const lOffers = offers.filter(o => o.listingId === l.id);
                  return (
                    <div key={l.id} className="gc" style={{ display: 'flex', gap: 14, padding: '12px 16px', cursor: 'pointer', alignItems: 'center' }}
                      onClick={() => navigate('marketplace')}>
                      <img src={l.image} alt={l.title} style={{ width: 54, height: 40, borderRadius: 8, objectFit: 'contain', background: 'var(--bg)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{l.sector}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{l.price.toLocaleString()} RWF</div>
                        {lOffers.length > 0 && (
                          <div style={{ fontSize: 11, color: 'var(--blue)', marginTop: 2 }}>{lOffers.length} {lang === 'en' ? 'offer(s)' : 'ibiciro'}</div>
                        )}
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                  );
                })}
              </div>
              <button className="btn-g" style={{ marginTop: 12, width: '100%' }} onClick={() => navigate('create-listing')}>
                {t.btn.createListing}
              </button>
            </div>
          )}

          {/* Active Offers (buyer) */}
          {user.role === 'buyer' && myOffersMade.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                {lang === 'en' ? 'My Active Offers' : 'Ibiciro Byanjye Bikora'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myOffersMade.slice(0, 5).map(o => {
                  const listing = listings.find(l => l.id === o.listingId);
                  const canReview = o.txStatus === 'completed' && !reviewedIds.includes(o.listingId);
                  return (
                    <div key={o.id} className="gc" style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('marketplace')}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{listing?.title || `Listing #${o.listingId}`}</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{o.date}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{o.amount.toLocaleString()} RWF</div>
                          <div style={{ marginTop: 4 }}><StatusBadge status={o.txStatus || o.status} /></div>
                        </div>
                      </div>
                      {o.status === 'countered' && (
                        <div className="al-w" style={{ marginTop: 8, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                          Counter: {o.counterAmount?.toLocaleString()} RWF - {o.counterMessage}
                        </div>
                      )}
                      {canReview && (
                        <button onClick={() => { setReviewModal({ listingId: o.listingId, listingTitle: listing?.title || `Listing #${o.listingId}` }); setReviewForm({ rating: 5, message: '' }); setReviewSent(false); }}
                          style={{ marginTop: 10, fontSize: 11, padding: '6px 14px', background: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b44', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                          {lang === 'en' ? 'Leave a Review' : 'Andika Igitekerezo'}
                        </button>
                      )}
                      {!canReview && o.txStatus === 'completed' && reviewedIds.includes(o.listingId) && (
                        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>
                          ✓ {lang === 'en' ? 'Review submitted' : 'Igitekerezo cyoherejwe'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Send Feedback */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {lang === 'en' ? 'Send Feedback to RECYX' : 'Ohereza Ibitekerezo kuri RECYX'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
              {lang === 'en' ? 'Report an issue, suggest a feature, or share your experience.' : 'Tangaza ikibazo, ugire igitekerezo, cyangwa usangire uburambe bwawe.'}
            </p>
            {feedbackSent ? (
              <div className="al-i" style={{ borderRadius: 12, padding: 16, fontSize: 13, fontWeight: 600 }}>
                ✓ {lang === 'en' ? 'Feedback sent! Thank you.' : 'Ibitekerezo byoherejwe! Murakoze.'}
              </div>
            ) : (
              <div className="gc" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <select className="fsl" value={feedbackForm.category} onChange={e => setFeedbackForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="general">{lang === 'en' ? 'General' : 'Rusange'}</option>
                    <option value="bug">{lang === 'en' ? 'Bug / Issue' : 'Ikibazo'}</option>
                    <option value="suggestion">{lang === 'en' ? 'Suggestion' : 'Igitekerezo'}</option>
                    <option value="complaint">{lang === 'en' ? 'Complaint' : 'Ikibazo gikomeye'}</option>
                  </select>
                </div>
                <textarea className="fi" rows={3} placeholder={lang === 'en' ? 'Describe your feedback...' : 'Sobanura ibitekerezo byawe...'} value={feedbackForm.message} onChange={e => setFeedbackForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'inherit', marginBottom: 10 }} />
                <button className="btn-p" disabled={!feedbackForm.message.trim()} onClick={() => {
                  if (!feedbackForm.message.trim()) return;
                  submitFeedback({ userId: user.id, userName: user.name, message: feedbackForm.message, category: feedbackForm.category });
                  setFeedbackSent(true);
                  setFeedbackForm({ category: 'general', message: '' });
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  {lang === 'en' ? 'Submit Feedback' : 'Ohereza'}
                </button>
              </div>
            )}
          </div>

          {/* Service Requests (technician) */}
          {user.role === 'technician' && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                {lang === 'en' ? 'Incoming Service Requests' : 'Ibyifuzo bya Serivisi Biinjiye'}
              </h3>
              {serviceReqs.length === 0 ? (
                <div className="gc" style={{ padding: 24, textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
                  {lang === 'en' ? 'No service requests yet.' : 'Nta byifuzo birahari.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {serviceReqs.map(r => (
                    <div key={r.id} className="gc" style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{r.citizenName || r.userId}</div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{r.device} — {r.problem?.slice(0, 60)}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{r.date}</div>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                      {r.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button className="btn-acc" style={{ flex: 1 }} onClick={async () => {
                            try {
                              await updateServiceRequest(r.id, 'confirmed');
                              setServiceReqs(sr => sr.map(x => x.id === r.id ? { ...x, status: 'confirmed' } : x));
                            } catch {
                              setToast({ message: 'Failed to accept request', type: 'error' });
                            }
                          }}>
                            {t.btn.accept}
                          </button>
                          <button className="btn-dec" style={{ flex: 1 }} onClick={async () => {
                            try {
                              await updateServiceRequest(r.id, 'cancelled');
                              setServiceReqs(sr => sr.map(x => x.id === r.id ? { ...x, status: 'cancelled' } : x));
                            } catch {
                              setToast({ message: 'Failed to decline request', type: 'error' });
                            }
                          }}>
                            {t.btn.decline}
                          </button>
                        </div>
                      )}
                      {(r.status === 'confirmed' || r.status === 'in_progress') && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                          <button className="btn-p" style={{ flex: 1, fontSize: 12 }} onClick={async () => {
                            try {
                              await updateServiceRequest(r.id, 'completed');
                              setServiceReqs(sr => sr.map(x => x.id === r.id ? { ...x, status: 'completed' } : x));
                            } catch {
                              setToast({ message: 'Failed to complete request', type: 'error' });
                            }
                          }}>
                            {lang === 'en' ? 'Mark Complete' : 'Soza Akazi'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications sidebar */}
        <div className="dash-side">
          <NotifPanel notifs={notifs} lang={lang} onMark={id => { markRead(id); setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x)); }} t={t} />
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg2)', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
              {lang === 'en' ? 'Leave a Review' : 'Andika Igitekerezo'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 18 }}>
              {reviewModal.listingTitle}
            </p>
            {reviewSent ? (
              <div className="al-i" style={{ borderRadius: 12, padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{lang === 'en' ? 'Review Submitted!' : 'Igitekerezo cyoherejwe!'}</div>
                <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{lang === 'en' ? 'It will be visible after admin approval.' : 'Bizagaragara nyuma yo kwemezwa n\'umuyobozi.'}</p>
                <button className="btn-p" style={{ marginTop: 16 }} onClick={() => setReviewModal(null)}>Close</button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>{lang === 'en' ? 'Your Rating' : 'Amanota Yawe'}</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: s <= reviewForm.rating ? '#f59e0b' : 'var(--border)', padding: 0, lineHeight: 1, transition: '.15s' }}>★</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>{lang === 'en' ? 'Your Review' : 'Igitekerezo Cyawe'}</label>
                  <textarea className="fi" rows={4} placeholder={lang === 'en' ? 'Share your experience...' : 'Sangira uburambe bwawe...'} value={reviewForm.message} onChange={e => setReviewForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn-g" style={{ flex: 1 }} onClick={() => setReviewModal(null)}>{lang === 'en' ? 'Cancel' : 'Hagarika'}</button>
                  <button className="btn-p" style={{ flex: 2 }} disabled={!reviewForm.message.trim()} onClick={async () => {
                    if (!reviewForm.message.trim()) return;
                    try {
                      await submitReview({ userId: user.id, userName: user.name, listingId: reviewModal.listingId, listingTitle: reviewModal.listingTitle, rating: reviewForm.rating, message: reviewForm.message });
                    } catch { /* best-effort */ }
                    setReviewSent(true);
                    setReviewedIds(ids => [...ids, reviewModal.listingId]);
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    {lang === 'en' ? 'Submit Review' : 'Ohereza'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotifPanel({ notifs, lang, onMark, t }) {
  return (
    <div className="gc" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>{t.dash.notifications}</h3>
      {notifs.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', padding: '16px 0' }}>{t.dash.noNotifications}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.slice(0, 10).map(n => (
            <div key={n.id} style={{
              padding: '10px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
              background: n.read ? 'transparent' : 'rgba(22,163,74,.05)',
              border: `1px solid ${n.read ? 'var(--border)' : 'rgba(22,163,74,.2)'}`,
              transition: '.2s',
            }} onClick={() => onMark(n.id)}>
              <p style={{ lineHeight: 1.4, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
              <p style={{ color: 'var(--text3)', fontSize: 10, marginTop: 4 }}>{n.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
