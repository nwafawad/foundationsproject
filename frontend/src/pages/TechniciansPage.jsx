import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { TECHNICIANS } from '../data/demoData';
import { createServiceRequest } from '../utils/mockService';
import { sectorsByDistrict } from '../data/sectors';
import Stars from '../components/Stars';
import Toast from '../components/Toast';

// All available specialisation filter options shown as pill buttons
const SPECS = ['all', 'Smartphones & Tablets', 'Laptops & Computers', 'Home Appliances', 'TVs & Monitors', 'Solar Panels & Inverters', 'Printers & Copiers'];

// Maps each spec label to a translation key used by the i18n system
const SPEC_KEYS = { all: 'all', 'Smartphones & Tablets': 'smartphones', 'Laptops & Computers': 'laptops', 'Home Appliances': 'appliances', 'TVs & Monitors': 'tvs', 'Solar Panels & Inverters': 'solar', 'Printers & Copiers': 'printers' };

// Small inline SVG icon reused in the empty-state when no technicians match the filters
function WrenchIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
}

// Page that lists all technicians with search/filter controls and a booking modal
export default function TechniciansPage({ navigate }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang]; // resolved translation object for the active language

  // ─── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');   // free-text search across name, spec, sector
  const [spec, setSpec] = useState('all');    // active specialisation pill filter
  const [sector, setSector] = useState('');   // selected sector from the grouped dropdown

  // ─── Booking modal state ───────────────────────────────────────────────────
  const [booking, setBooking] = useState(null);   // the technician being booked (null = modal closed)
  const [bookForm, setBookForm] = useState({ device: '', problem: '', date: '', time: '', contact: '' });
  const [bookErrors, setBookErrors] = useState({}); // field-level validation errors
  const [loading, setLoading] = useState(false);    // true while the simulated API call is in-flight
  const [toast, setToast] = useState(null);
  const [booked, setBooked] = useState(false);      // true after successful submission — shows success screen

  // Derive the filtered technician list; recalculates only when filters change
  const filtered = useMemo(() => {
    let res = TECHNICIANS;
    // Spec filter: match the first 6 chars of the spec (avoids "& " noise in the comparison)
    if (spec !== 'all') res = res.filter(t => t.spec.toLowerCase().includes(spec.toLowerCase().replace(' & ', '').slice(0, 6)));
    // Free-text filter: matches name, specialisation, or sector
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(t => t.name.toLowerCase().includes(q) || t.spec.toLowerCase().includes(q) || t.sector.toLowerCase().includes(q));
    }
    // Sector filter: compare only the sector name part (before the comma)
    if (sector) res = res.filter(t => t.sector.includes(sector.split(',')[0]));
    return res;
  }, [search, spec, sector]);

  // Shorthand to update a single booking form field without overwriting the rest
  const setF = (k, v) => setBookForm(f => ({ ...f, [k]: v }));

  // Validates the booking form and, if valid, submits a service request
  const handleBook = () => {
    const e = {};
    if (!bookForm.device.trim()) e.device = t.errors.required;
    if (!bookForm.problem.trim()) e.problem = t.errors.required;
    if (!bookForm.date) e.date = t.errors.required;
    if (!bookForm.contact.trim()) e.contact = t.errors.required;
    setBookErrors(e);
    if (Object.keys(e).length > 0) return; // stop if any required fields are empty

    // Redirect unauthenticated users to login before booking
    if (!user) { navigate('login'); return; }

    setLoading(true);
    // 700ms delay simulates a real API call
    setTimeout(() => {
      createServiceRequest({
        techId: booking.id,
        techName: booking.name,
        userId: user.id,
        userName: user.name,
        device: bookForm.device,
        problem: bookForm.problem,
        date: bookForm.date,
        time: bookForm.time,
        contact: bookForm.contact || user.phone || '', // fall back to the user's profile phone
      });
      setLoading(false);
      setBooked(true); // switch the modal to the success confirmation screen
    }, 700);
  };

  return (
    <div className="pg pi">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="pg-h">
        <h1 className="pg-t">{t.tech.heading}</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6 }}>{t.tech.sub}</p>
      </div>

      {/* ── Filters ── */}
      <div className="fb" style={{ flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Free-text search */}
          <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="search-input"
              placeholder={lang === 'en' ? 'Search by name or specialization...' : 'Shakisha izina cyangwa inzobere...'}
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Sector dropdown — options grouped by district for easier navigation */}
          <select className="fsl" value={sector} onChange={e => setSector(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">{lang === 'en' ? 'All Sectors' : 'Uduce Twose'}</option>
            {Object.keys(sectorsByDistrict).sort().map(d => (
              <optgroup key={d} label={d}>
                {sectorsByDistrict[d].map(s => <option key={s} value={`${s}, ${d}`}>{s}</option>)}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Specialisation pill filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SPECS.map(s => (
            <button key={s} className={`filter-btn${spec === s ? ' active' : ''}`} onClick={() => setSpec(s)}>
              {s === 'all' ? t.tech.specs.all : s}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
        {filtered.length} {lang === 'en' ? 'technicians found' : 'abatekinsiye babonetse'}
      </p>

      {/* Empty state or technician grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text2)' }}>
          <WrenchIcon size={40} />
          <p style={{ marginTop: 14 }}>{t.tech.noResults}</p>
        </div>
      ) : (
        <div className="tg">
          {filtered.map(tech => (
            <TechCard
              key={tech.id}
              tech={tech}
              lang={lang}
              t={t}
              onBook={() => {
                setBooking(tech);
                setBooked(false);
                // Pre-fill the contact field with the logged-in user's phone if available
                setBookForm({ device: '', problem: '', date: '', time: '', contact: user?.phone || '' });
              }}
            />
          ))}
        </div>
      )}

      {/* ── Booking Modal ── */}
      {booking && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
          zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <div style={{
            background: 'var(--bg2)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
          }}>

            {/* Success screen — shown after the booking is submitted */}
            {booked ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-l)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{t.success.bookingCreated}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
                  {booking.name} {lang === 'en' ? 'will contact you at' : 'azakuvugisha kuri'} {bookForm.contact}.
                </p>
                <button className="btn-p" style={{ width: '100%' }} onClick={() => setBooking(null)}>
                  {lang === 'en' ? 'Done' : 'Rangiye'}
                </button>
              </div>
            ) : (
              // Booking form
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>{t.tech.book.heading}</h3>
                  <button onClick={() => setBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 18 }}>✕</button>
                </div>

                {/* Technician summary strip at the top of the booking form */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--bg)', borderRadius: 12, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--green),var(--blue))', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {booking.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{booking.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{booking.spec} · {booking.sector}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Stars rating={booking.rating} size={13} showNum />
                  </div>
                </div>

                {/* Device name */}
                <div className="fg">
                  <label className="fl">{t.tech.book.device} *</label>
                  <input className="fi" value={bookForm.device} onChange={e => setF('device', e.target.value)} placeholder={lang === 'en' ? 'e.g. Samsung Galaxy A52' : 'Urugero: Samsung Galaxy A52'} />
                  {bookErrors.device && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{bookErrors.device}</p>}
                </div>

                {/* Problem description */}
                <div className="fg">
                  <label className="fl">{t.tech.book.problem} *</label>
                  <textarea className="fi" rows={3} value={bookForm.problem} onChange={e => setF('problem', e.target.value)} placeholder={lang === 'en' ? 'Describe the issue in detail...' : 'Sobanura ikibazo mu birambuye...'} style={{ resize: 'vertical' }} />
                  {bookErrors.problem && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{bookErrors.problem}</p>}
                </div>

                {/* Date and time side by side — time is optional */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="fg">
                    <label className="fl">{lang === 'en' ? 'Preferred Date' : 'Itariki'} *</label>
                    {/* min prevents selecting dates in the past */}
                    <input className="fi" type="date" value={bookForm.date} onChange={e => setF('date', e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    {bookErrors.date && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{bookErrors.date}</p>}
                  </div>
                  <div className="fg">
                    <label className="fl">{lang === 'en' ? 'Preferred Time' : 'Igihe'}</label>
                    <input className="fi" type="time" value={bookForm.time} onChange={e => setF('time', e.target.value)} />
                  </div>
                </div>

                {/* Contact number the technician will use to reach the user */}
                <div className="fg">
                  <label className="fl">{t.tech.book.contact} *</label>
                  <input className="fi" value={bookForm.contact} onChange={e => setF('contact', e.target.value)} placeholder="+250 7XX XXX XXX" />
                  {bookErrors.contact && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{bookErrors.contact}</p>}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button className="btn-g" style={{ flex: 1 }} onClick={() => setBooking(null)}>{t.btn.cancel}</button>
                  {/* Submit takes up 2/3 of the row to draw focus */}
                  <button className="btn-p" style={{ flex: 2 }} onClick={handleBook} disabled={loading}>
                    {loading ? '...' : t.tech.book.submit}
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

// Individual technician card with hover lift animation and a Book Now CTA
function TechCard({ tech, lang, t, onBook }) {
  const [hov, setHov] = useState(false); // drives the hover lift effect
  // Fixed green palette — all cards share the same colour scheme
  const bg = '#f0fdf4';
  const color = '#15803d';
  const accent = '#dcfce7';

  return (
    <div
      style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: hov ? 'var(--shadow-lg)' : '0 1px 6px rgba(0,0,0,.06)',
        transform: hov ? 'translateY(-5px)' : 'none', // lift on hover
        transition: 'all .3s', animation: 'fadeUp .4s ease-out both',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Decorative gradient strip at the top of the card */}
      <div style={{ height: 60, background: `linear-gradient(135deg, ${accent}, ${bg})`, flexShrink: 0 }} />

      {/* Avatar overlaps the header strip via negative marginTop */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: -38 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'var(--bg2)', color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 19, fontWeight: 800,
          border: `2px solid ${accent}`,
          boxShadow: '0 4px 14px rgba(0,0,0,.10)',
        }}>
          {tech.avatar}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '10px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>

        {/* Name */}
        <h3 style={{ fontSize: 15, fontWeight: 800, textAlign: 'center', marginBottom: 8, marginTop: 6 }}>{tech.name}</h3>

        {/* Specialisation badge */}
        <span style={{
          background: accent, color, borderRadius: 100,
          padding: '3px 12px', fontSize: 10, fontWeight: 600, marginBottom: 12,
        }}>
          {tech.spec}
        </span>

        {/* Star rating with numeric value */}
        <div style={{ marginBottom: 14 }}>
          <Stars rating={tech.rating} size={14} showNum />
        </div>

        {/* Jobs completed / years experience stats row */}
        <div style={{
          display: 'flex', width: '100%', borderRadius: 12,
          border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16,
        }}>
          <div style={{ flex: 1, padding: '9px 0', textAlign: 'center', borderRight: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{tech.jobs}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500, marginTop: 1 }}>{t.tech.jobsCompleted}</div>
          </div>
          <div style={{ flex: 1, padding: '9px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{tech.exp}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 500, marginTop: 1 }}>{t.tech.yearsExp}</div>
          </div>
        </div>

        {/* Location and phone */}
        <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 12, marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text2)', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </span>
            {tech.sector}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text2)', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text3)', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </span>
            {tech.phone}
          </div>
        </div>

        {/* Book Now CTA — pinned to the bottom of the card via marginTop: auto */}
        <button className="btn-p" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }} onClick={onBook}>
          {t.btn.bookNow}
        </button>
      </div>
    </div>
  );
}