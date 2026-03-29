import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import {
  suspendUser, deleteUser, removeListing, flagListing, cancelTransaction,
  getReviews, getFeedback, approveReview, deleteReview, markFeedbackRead, deleteFeedback,
  getPublishedTestimonials, addTestimonial, deleteTestimonial,
} from '../utils/mockService';
import {
  adminGetAllUsers, adminApproveUser, adminRejectUser, adminGetStats,
  adminGetAllListings, adminApproveListing, adminRejectListing,
} from '../utils/api';
import { RoleBadge, StatusBadge } from '../components/Badge';
import Toast from '../components/Toast';

function StatCard({ label, value, color, bg, icon }) {
  return (
    <div className="admin-stat gc">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-1px' }}>{value}</div>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg2)', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
        </div>
        <p style={{ textAlign: 'center', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-g" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button className="btn-dec" style={{ flex: 1, justifyContent: 'center' }} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ navigate }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang];

  const [tab, setTab] = useState('accounts');
  const [stats, setStats] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [allOffers, setAllOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', text: '', rating: 5 });
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [listingSearch, setListingSearch] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('all');

  const reload = async () => {
    try {
      const [users, stats] = await Promise.all([adminGetAllUsers(), adminGetStats()]);
      setAllUsers(users);
      setStats(stats);
    } catch {
      // API unreachable — leave existing state
    }
    try {
      const listings = await adminGetAllListings();
      setAllListings(listings);
    } catch {
      // API unreachable — leave existing state
    }
    setAllOffers([]);
    setReviews(getReviews());
    setFeedback(getFeedback());
    setTestimonials(getPublishedTestimonials());
  };

  useEffect(() => { reload(); }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="pg pi" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h2 style={{ marginBottom: 12 }}>{t.errors.adminOnly}</h2>
        <button className="btn-p" onClick={() => navigate('login')}>{t.btn.login}</button>
      </div>
    );
  }

  // ── Action helpers ──
  const ask = (message, onConfirm) => setConfirm({ message, onConfirm });

  const doApproveUser = async (id) => {
    try {
      await adminApproveUser(id);
      await reload();
      setToast({ message: t.success.userApproved, type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Approval failed', type: 'error' });
    }
  };
  const doRejectUser = (id) => ask(`Reject this user account permanently?`, async () => {
    try {
      await adminRejectUser(id);
      setConfirm(null);
      await reload();
      setToast({ message: t.success.userRejected, type: 'info' });
    } catch (err) {
      setConfirm(null);
      setToast({ message: err?.message || 'Rejection failed', type: 'error' });
    }
  });
  const doSuspendUser = (id, name, currently) => {
    ask(`${currently ? 'Unsuspend' : 'Suspend'} account for "${name}"?`, () => {
      suspendUser(id); reload(); setConfirm(null);
      setToast({ message: `Account ${currently ? 'unsuspended' : 'suspended'}.`, type: currently ? 'success' : 'info' });
    });
  };
  const doDeleteUser = (id, name) => ask(`Permanently delete account for "${name}" and all their data? This cannot be undone.`, () => { deleteUser(id); reload(); setConfirm(null); setToast({ message: 'User deleted.', type: 'info' }); });

  const doApproveListing = async (id) => {
    try {
      await adminApproveListing(id);
      await reload();
      setToast({ message: t.success.listingApproved, type: 'success' });
    } catch (err) {
      setToast({ message: err?.message || 'Approval failed', type: 'error' });
    }
  };
  const doRejectListing = (id) => ask('Reject this listing?', async () => {
    try {
      await adminRejectListing(id);
      setConfirm(null);
      await reload();
      setToast({ message: t.success.listingRejected, type: 'info' });
    } catch (err) {
      setConfirm(null);
      setToast({ message: err?.message || 'Rejection failed', type: 'error' });
    }
  });
  const doRemoveListing = (id, title) => ask(`Remove listing "${title}" from the platform? All related offers will be cancelled.`, () => { removeListing(id); reload(); setConfirm(null); setToast({ message: 'Listing removed.', type: 'info' }); });
  const doFlagListing = (id, currently) => { const r = flagListing(id); reload(); setToast({ message: r.flagged ? 'Listing flagged for review.' : 'Flag removed.', type: 'info' }); };
  const doCancelTx = (id) => ask('Cancel this transaction? The listing will be returned to available status.', () => { cancelTransaction(id); reload(); setConfirm(null); setToast({ message: 'Transaction cancelled.', type: 'info' }); });

  const doApproveReview = (id) => { approveReview(id); reload(); setToast({ message: 'Review approved and published as testimonial.', type: 'success' }); };
  const doDeleteReview = (id) => ask('Delete this review permanently?', () => { deleteReview(id); reload(); setConfirm(null); setToast({ message: 'Review deleted.', type: 'info' }); });
  const doMarkFeedbackRead = (id) => { markFeedbackRead(id); reload(); };
  const doDeleteFeedback = (id) => ask('Delete this feedback message?', () => { deleteFeedback(id); reload(); setConfirm(null); setToast({ message: 'Feedback deleted.', type: 'info' }); });

  const doAddTestimonial = (e) => {
    e.preventDefault();
    if (!testimonialForm.name || !testimonialForm.role || !testimonialForm.text) return;
    addTestimonial(testimonialForm);
    reload();
    setTestimonialForm({ name: '', role: '', text: '', rating: 5 });
    setToast({ message: 'Testimonial added successfully.', type: 'success' });
  };
  const doDeleteTestimonial = (id) => ask('Remove this testimonial from the homepage?', () => { deleteTestimonial(id); reload(); setConfirm(null); setToast({ message: 'Testimonial removed.', type: 'info' }); });

  // ── Filtered views ──
  const filteredUsers = useMemo(() => allUsers.filter(u => {
    const q = userSearch.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.sector || '').toLowerCase().includes(q);
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchStatus = userStatusFilter === 'all'
      || (userStatusFilter === 'active' && u.verified && !u.suspended)
      || (userStatusFilter === 'pending' && !u.verified)
      || (userStatusFilter === 'suspended' && u.suspended);
    return matchSearch && matchRole && matchStatus;
  }), [allUsers, userSearch, userRoleFilter, userStatusFilter]);

  const filteredListings = useMemo(() => allListings.filter(l => {
    const q = listingSearch.toLowerCase();
    const matchSearch = !q || l.title.toLowerCase().includes(q) || (l.sector || '').toLowerCase().includes(q);
    const matchStatus = listingStatusFilter === 'all' || l.status === listingStatusFilter || (listingStatusFilter === 'flagged' && l.flagged);
    return matchSearch && matchStatus;
  }), [allListings, listingSearch, listingStatusFilter]);

  const tabs = [
    { key: 'accounts', label: lang === 'en' ? 'Users' : 'Abakoresheje', count: stats.pendingUsers },
    { key: 'listings', label: lang === 'en' ? 'Listings' : 'Amatangazo', count: stats.pendingListings + (stats.flaggedListings || 0) },
    { key: 'transactions', label: lang === 'en' ? 'Transactions' : 'Ubucuruzi', count: stats.activeTransactions },
    { key: 'reviews', label: lang === 'en' ? 'Reviews & Feedback' : 'Ibitekerezo', count: (stats.pendingReviews || 0) + (stats.unreadFeedback || 0) },
    { key: 'testimonials', label: lang === 'en' ? 'Testimonials' : 'Imivugo', count: 0 },
  ];

  const userStatusColor = (u) => {
    if (u.suspended) return { bg: '#fee2e2', color: '#dc2626', label: 'Suspended' };
    if (!u.verified) return { bg: '#fef3c7', color: '#d97706', label: 'Pending' };
    return { bg: '#dcfce7', color: '#16a34a', label: 'Active' };
  };

  return (
    <div className="pg pi">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <div className="pg-h">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <h1 className="pg-t">{t.pages.admin}</h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text2)' }}>
          {lang === 'en' ? `Signed in as ${user.name}. Full platform management — users, listings, and transactions.` : `Winjiye nka ${user.name}. Genzura abakoresheje, amatangazo, n'ubucuruzi.`}
        </p>
      </div>

      {/* Stats - 2 rows */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 8 }}>
        <StatCard label={lang === 'en' ? 'Total Users' : 'Abakoresheje'} value={stats.totalUsers || 0} color="#7c3aed" bg="#ede9fe"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>} />
        <StatCard label={lang === 'en' ? 'Pending Approval' : 'Birategerezwa'} value={stats.pendingUsers || 0} color="#f59e0b" bg="#fef3c7"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} />
        <StatCard label={lang === 'en' ? 'Active Listings' : 'Amatangazo' } value={stats.totalListings || 0} color="#16a34a" bg="#dcfce7"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /></svg>} />
        <StatCard label={lang === 'en' ? 'Active Transactions' : 'Ubucuruzi' } value={stats.activeTransactions || 0} color="#0ea5e9" bg="#e0f2fe"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>} />
      </div>
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
        <StatCard label={lang === 'en' ? 'Suspended' : 'Barahagaritswe'} value={stats.suspendedUsers || 0} color="#dc2626" bg="#fee2e2"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>} />
        <StatCard label={lang === 'en' ? 'Flagged Listings' : 'Biragenewe'} value={stats.flaggedListings || 0} color="#f59e0b" bg="#fef3c7"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>} />
        <StatCard label={lang === 'en' ? 'Completed Tx' : 'Byarangiye'} value={stats.completedTx || 0} color="#16a34a" bg="#dcfce7"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>} />
        <StatCard label={lang === 'en' ? 'Pending Listings' : 'Birategerezwa'} value={stats.pendingListings || 0} color="#ef4444" bg="#fee2e2"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>} />
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map(tb => (
          <button key={tb.key} className={`at${tab === tb.key ? ' att' : ''}`} onClick={() => setTab(tb.key)}>
            {tb.label}
            {tb.count > 0 && (
              <span style={{ marginLeft: 6, background: tab === tb.key ? 'rgba(255,255,255,.25)' : 'var(--red)', color: '#fff', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                {tb.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: USERS ── */}
      {tab === 'accounts' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="search-input" placeholder={lang === 'en' ? 'Search users...' : 'Shakisha...'} value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <select className="fsl" value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
              <option value="all">{lang === 'en' ? 'All Roles' : 'Inshingano Zose'}</option>
              <option value="citizen">{t.roles.citizen}</option>
              <option value="buyer">{t.roles.buyer}</option>
              <option value="technician">{t.roles.technician}</option>
              <option value="recycler">{t.roles.recycler}</option>
            </select>
            <select className="fsl" value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)}>
              <option value="all">{lang === 'en' ? 'All Status' : 'Imiterere Yose'}</option>
              <option value="active">{lang === 'en' ? 'Active' : 'Bikora'}</option>
              <option value="pending">{lang === 'en' ? 'Pending' : 'Birategerezwa'}</option>
              <option value="suspended">{lang === 'en' ? 'Suspended' : 'Barahagaritswe'}</option>
            </select>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
            {filteredUsers.length} {lang === 'en' ? 'users found' : 'abakoresheje babonetse'}
          </p>

          {filteredUsers.length === 0 ? (
            <div className="gc" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
              {lang === 'en' ? 'No users match your filters.' : 'Nta bakoresheje bahuye n\'ubushakashatsi.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredUsers.map(u => {
                const statusStyle = userStatusColor(u);
                const isPending = !u.verified && ['technician', 'recycler'].includes(u.role);
                return (
                  <div key={u.id} className="gc" style={{ padding: '16px 20px', borderLeft: u.suspended ? '3px solid #dc2626' : u.flagged ? '3px solid #f59e0b' : '3px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      {/* Avatar */}
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,var(--green),var(--blue))', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: u.suspended ? 0.5 : 1 }}>
                        {u.profilePhoto
                          ? <img src={u.profilePhoto} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                          : (u.avatar || u.name?.[0])}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</span>
                          <RoleBadge role={u.role} />
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, borderRadius: 100, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>{statusStyle.label}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>{u.email}</div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
                          {u.sector}{u.spec ? ` · ${u.spec}` : ''}{u.company ? ` · ${u.company}` : ''}
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {isPending && <>
                          <button className="btn-acc" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => doApproveUser(u.id)}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            {t.btn.approve}
                          </button>
                          <button className="btn-ctr" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => scheduleVisit(u.id, 'user') && setToast({ message: t.success.visitScheduled, type: 'info' })}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            {lang === 'en' ? 'Schedule' : 'Shyira ku genda'}
                          </button>
                        </>}
                        {!isPending && (
                          <button
                            onClick={() => doSuspendUser(u.id, u.name, u.suspended)}
                            style={{ fontSize: 11, padding: '6px 12px', background: u.suspended ? 'var(--green-l)' : '#fef3c7', color: u.suspended ? 'var(--green)' : '#b45309', border: `1px solid ${u.suspended ? 'var(--green)' : '#f59e0b'}44`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" />{u.suspended ? <polyline points="20 6 9 17 4 12" /> : <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />}</svg>
                            {u.suspended ? (lang === 'en' ? 'Unsuspend' : 'Rekura') : (lang === 'en' ? 'Suspend' : 'Hagarika')}
                          </button>
                        )}
                        <button
                          onClick={() => doDeleteUser(u.id, u.name)}
                          style={{ fontSize: 11, padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc262644', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></svg>
                          {lang === 'en' ? 'Delete' : 'Siba'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: LISTINGS ── */}
      {tab === 'listings' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input className="search-input" placeholder={lang === 'en' ? 'Search listings...' : 'Shakisha amatangazo...'} value={listingSearch} onChange={e => setListingSearch(e.target.value)} />
            </div>
            <select className="fsl" value={listingStatusFilter} onChange={e => setListingStatusFilter(e.target.value)}>
              <option value="all">{lang === 'en' ? 'All Listings' : 'Yose'}</option>
              <option value="pending_review">{lang === 'en' ? 'Pending Review' : 'Birategerezwa'}</option>
              <option value="available">{lang === 'en' ? 'Live' : 'Bikora'}</option>
              <option value="flagged">{lang === 'en' ? 'Flagged' : 'Biragenewe'}</option>
            </select>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12 }}>
            {filteredListings.length} {lang === 'en' ? 'listings' : 'amatangazo'}
          </p>

          {filteredListings.length === 0 ? (
            <div className="gc" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
              {lang === 'en' ? 'No listings match your filters.' : 'Nta matangazo ahuye n\'ubushakashatsi.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredListings.map(l => {
                const isPending = l.status === 'pending_review';
                return (
                  <div key={l.id} className="gc" style={{ padding: '16px 20px', borderLeft: l.flagged ? '3px solid #f59e0b' : isPending ? '3px solid #0ea5e9' : '3px solid transparent' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <img src={l.image} alt={l.title} style={{ width: 80, height: 58, borderRadius: 10, objectFit: 'contain', background: 'var(--bg)', flexShrink: 0 }}
                        onError={e => { e.target.style.display = 'none'; }} />
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</span>
                          <StatusBadge status={l.status} />
                          {l.flagged && <span style={{ background: '#fef3c7', color: '#b45309', borderRadius: 100, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>Flagged</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{l.description?.slice(0, 90)}{l.description?.length > 90 ? '...' : ''}</div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', fontSize: 11, color: 'var(--text3)' }}>
                          <span style={{ background: 'var(--bg)', borderRadius: 6, padding: '1px 8px', textTransform: 'capitalize', fontWeight: 600, color: 'var(--text2)' }}>{l.material}</span>
                          <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>{l.price?.toLocaleString()} RWF</span>
                          <span>{l.sector}</span>
                          <span>{l.date}</span>
                          <span>{l.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                      {isPending && <>
                        <button className="btn-acc" style={{ flex: 1, minWidth: 90, fontSize: 12 }} onClick={() => doApproveListing(l.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          {t.btn.approve}
                        </button>
                        <button className="btn-ctr" style={{ flex: 1, minWidth: 90, fontSize: 12 }} onClick={() => { scheduleVisit(l.id, 'listing'); setToast({ message: t.success.visitScheduled, type: 'info' }); }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          {t.btn.scheduleVisit}
                        </button>
                        <button className="btn-dec" style={{ flex: 1, minWidth: 90, fontSize: 12 }} onClick={() => doRejectListing(l.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          {t.btn.reject}
                        </button>
                      </>}
                      {!isPending && <>
                        <button
                          onClick={() => doFlagListing(l.id, l.flagged)}
                          style={{ fontSize: 12, padding: '7px 14px', background: l.flagged ? '#fef3c7' : 'var(--bg2)', color: l.flagged ? '#b45309' : 'var(--text2)', border: `1px solid ${l.flagged ? '#f59e0b' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
                          {l.flagged ? (lang === 'en' ? 'Unflag' : 'Tangura') : (lang === 'en' ? 'Flag' : 'Genera')}
                        </button>
                        <button
                          onClick={() => doRemoveListing(l.id, l.title)}
                          style={{ fontSize: 12, padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc262644', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                          {lang === 'en' ? 'Remove' : 'Kura'}
                        </button>
                      </>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: REVIEWS & FEEDBACK ── */}
      {tab === 'reviews' && (
        <div>
          {/* Pending Reviews */}
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            {lang === 'en' ? 'User Reviews' : 'Ibitekerezo by\'Abakoresheje'}
            {reviews.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ marginLeft: 8, background: '#fef3c7', color: '#b45309', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {reviews.filter(r => r.status === 'pending').length} pending
              </span>
            )}
          </h3>
          {reviews.length === 0 ? (
            <div className="gc" style={{ padding: 32, textAlign: 'center', color: 'var(--text2)', marginBottom: 28 }}>
              {lang === 'en' ? 'No reviews submitted yet.' : 'Nta bitekerezo birishwe.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {reviews.map(r => (
                <div key={r.id} className="gc" style={{ padding: '16px 20px', borderLeft: r.status === 'pending' ? '3px solid #f59e0b' : r.status === 'approved' ? '3px solid #16a34a' : '3px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{r.userName}</span>
                        <span style={{ background: r.status === 'pending' ? '#fef3c7' : '#dcfce7', color: r.status === 'pending' ? '#b45309' : '#16a34a', borderRadius: 100, padding: '1px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{r.status}</span>
                        <span style={{ display: 'flex', gap: 2 }}>
                          {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? '#f59e0b' : 'var(--border)', fontSize: 13 }}>★</span>)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
                        {lang === 'en' ? 'On:' : 'Ku:'} <strong>{r.listingTitle}</strong> · {r.date}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic' }}>"{r.message}"</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {r.status === 'pending' && (
                        <button className="btn-acc" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => doApproveReview(r.id)}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          {lang === 'en' ? 'Approve & Publish' : 'Emeza'}
                        </button>
                      )}
                      <button onClick={() => doDeleteReview(r.id)} style={{ fontSize: 11, padding: '6px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc262644', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                        {lang === 'en' ? 'Delete' : 'Siba'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Feedback Messages */}
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            {lang === 'en' ? 'Platform Feedback' : 'Ibitekerezo bya Platform'}
            {feedback.filter(f => !f.read).length > 0 && (
              <span style={{ marginLeft: 8, background: '#e0f2fe', color: '#0369a1', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                {feedback.filter(f => !f.read).length} unread
              </span>
            )}
          </h3>
          {feedback.length === 0 ? (
            <div className="gc" style={{ padding: 32, textAlign: 'center', color: 'var(--text2)' }}>
              {lang === 'en' ? 'No feedback submitted yet.' : 'Nta bitekerezo birishwe.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {feedback.map(f => (
                <div key={f.id} className="gc" style={{ padding: '16px 20px', borderLeft: !f.read ? '3px solid #0ea5e9' : '3px solid transparent', cursor: 'pointer' }}
                  onClick={() => !f.read && doMarkFeedbackRead(f.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{f.userName}</span>
                        <span style={{ background: 'var(--bg)', borderRadius: 6, padding: '1px 8px', fontSize: 10, fontWeight: 600, color: 'var(--text2)', textTransform: 'capitalize' }}>{f.category}</span>
                        {!f.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }} />}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{f.message}</p>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{f.date}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); doDeleteFeedback(f.id); }} style={{ fontSize: 11, padding: '5px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc262644', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, flexShrink: 0 }}>
                      {lang === 'en' ? 'Delete' : 'Siba'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TESTIMONIALS ── */}
      {tab === 'testimonials' && (
        <div>
          {/* Add Testimonial Form */}
          <div className="gc" style={{ padding: '20px 24px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              {lang === 'en' ? 'Add New Testimonial' : 'Ongeraho Imivugo Mishya'}
            </h3>
            <form onSubmit={doAddTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>{lang === 'en' ? 'Full Name *' : 'Amazina Yuzuye *'}</label>
                  <input className="fi" placeholder={lang === 'en' ? 'e.g. Ange Mutesi' : 'nk\'Ange Mutesi'} value={testimonialForm.name} onChange={e => setTestimonialForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>{lang === 'en' ? 'Role / Location *' : 'Inshingano / Ahantu *'}</label>
                  <input className="fi" placeholder={lang === 'en' ? 'e.g. Citizen, Kimironko' : 'nk\'Umuturage, Kimironko'} value={testimonialForm.role} onChange={e => setTestimonialForm(f => ({ ...f, role: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>{lang === 'en' ? 'Testimonial Message *' : 'Ubutumwa bw\'Imivugo *'}</label>
                <textarea className="fi" rows={3} placeholder={lang === 'en' ? 'What did this user say about RECYX?' : 'Uyu mukoresheje yabikoze ate?'} value={testimonialForm.text} onChange={e => setTestimonialForm(f => ({ ...f, text: e.target.value }))} required style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>{lang === 'en' ? 'Rating' : 'Amanota'}</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setTestimonialForm(f => ({ ...f, rating: s }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: s <= testimonialForm.rating ? '#f59e0b' : 'var(--border)', padding: 0, lineHeight: 1 }}>★</button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn-p" style={{ marginLeft: 'auto', marginTop: 16 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  {lang === 'en' ? 'Add Testimonial' : 'Ongeraho'}
                </button>
              </div>
            </form>
          </div>

          {/* Current Testimonials */}
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
            {lang === 'en' ? `Published Testimonials (${testimonials.length})` : `Imivugo Yashyizwe Ahagaragara (${testimonials.length})`}
          </h3>
          {testimonials.length === 0 ? (
            <div className="gc" style={{ padding: 32, textAlign: 'center', color: 'var(--text2)' }}>
              {lang === 'en' ? 'No testimonials yet. Add one above.' : 'Nta mivugo irahari.'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {testimonials.map(t2 => (
                <div key={t2.id} className="gc" style={{ padding: '16px 18px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--blue))', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {t2.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t2.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{t2.role}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= t2.rating ? '#f59e0b' : 'var(--border)', fontSize: 11 }}>★</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 12 }}>"{t2.text}"</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, background: t2.source === 'review' ? '#e0f2fe' : '#dcfce7', color: t2.source === 'review' ? '#0369a1' : '#16a34a', borderRadius: 6, padding: '2px 7px', fontWeight: 600, textTransform: 'uppercase' }}>
                      {t2.source === 'review' ? 'From Review' : 'Admin Added'}
                    </span>
                    <button onClick={() => doDeleteTestimonial(t2.id)} style={{ fontSize: 11, padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc262644', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                      {lang === 'en' ? 'Remove' : 'Kura'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TRANSACTIONS ── */}
      {tab === 'transactions' && (
        <div>
          {allOffers.filter(o => ['accepted', 'countered'].includes(o.status)).length === 0 ? (
            <div className="gc" style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
              {t.admin.noTransactions}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allOffers.filter(o => ['accepted', 'countered'].includes(o.status)).map(o => {
                const listing = allListings.find(l => l.id === o.listingId);
                return (
                  <div key={o.id} className="gc" style={{ padding: '16px 20px', borderLeft: o.cancelledByAdmin ? '3px solid #dc2626' : o.txStatus === 'completed' ? '3px solid #16a34a' : '3px solid #0ea5e9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{listing?.title || `Listing #${o.listingId}`}</span>
                          <StatusBadge status={o.txStatus || o.status} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 2 }}>
                          <span>{lang === 'en' ? 'Buyer:' : 'Umugura:'} <strong>{o.buyerName}</strong></span>
                          {listing && <span> · {lang === 'en' ? 'Seller ID:' : 'Umucuruzi:'} <strong>#{listing.sellerId}</strong></span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text3)' }}>{o.date} · Offer #{o.id}</div>
                        {o.message && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, fontStyle: 'italic' }}>"{o.message}"</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>{(o.amount || 0).toLocaleString()} RWF</div>
                        {o.txStatus !== 'completed' && !o.cancelledByAdmin && (
                          <button
                            onClick={() => doCancelTx(o.id)}
                            style={{ marginTop: 8, fontSize: 11, padding: '5px 12px', background: '#fee2e2', color: '#dc2626', border: '1px solid #dc262644', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            {lang === 'en' ? 'Cancel Tx' : 'Hagarika'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
