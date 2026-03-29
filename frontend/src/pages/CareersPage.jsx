import React, { useState } from 'react';
import { useLang } from '../context/LangContext';
import T from '../data/translations';

const JOBS = [
  { title: "Full-Stack Developer", dept: "Engineering", type: "Full-time", location: "Kigali" },
  { title: "Community Coordinator", dept: "Operations", type: "Full-time", location: "Field-based" },
  { title: "UX/UI Designer", dept: "Design", type: "Full-time", location: "Kigali" },
  { title: "Data Analyst", dept: "Analytics", type: "Contract", location: "Remote" },
  { title: "Mobile Developer", dept: "Engineering", type: "Full-time", location: "Kigali" },
  { title: "Impact & Sustainability Researcher", dept: "Research", type: "Full-time", location: "Kigali" },
];

const WHY_ICONS = [
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
];

const WHY = [
  { title: "Real Impact", desc: "Work on problems that matter - reducing e-waste and building Rwanda's circular economy." },
  { title: "Fast Growth", desc: "Join a fast-moving startup backed by ALU's innovation ecosystem with direct mentorship." },
  { title: "Purpose-Driven", desc: "Contribute to UN SDGs 9, 11, 12, and 13. Your work shapes Rwanda's environmental future." },
];

export default function CareersPage() {
  const { lang } = useLang();
  const t = T[lang];
  const [open, setOpen] = useState(null);

  return (
    <div className="pg pi">
      <div className="pg-h">
        <h1 className="pg-t">{t.pages.careers}</h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginTop: 6 }}>
          {lang === 'en'
            ? 'Join Team 7 and help build Rwanda\'s most impactful environmental technology platform.'
            : 'Injira mu Itsinda 7 kandi utunge ubuyobozi bw\'urubuga rwa tekinoloji y\'ibidukikije rwagira ingaruka nyinshi mu Rwanda.'}
        </p>
      </div>

      {/* Why RECYX */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        {WHY.map((w, i) => (
          <div key={i} className="gc" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--green-l)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              {WHY_ICONS[i]}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{w.title}</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{w.desc}</p>
          </div>
        ))}
      </div>

      {/* Open Roles */}
      <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
        {lang === 'en' ? 'Open Positions' : 'Imirimo Ifunguye'}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 22 }}>
        {lang === 'en' ? 'Send your CV and a short cover letter to ' : 'Ohereza CV yawe na barua ngufi ya kwinjira kuri '}
        <a href="mailto:careers@recyx.rw" style={{ color: 'var(--green)', fontWeight: 600 }}>careers@recyx.rw</a>
        {lang === 'en' ? ' with the job title as the subject line.' : ' ucishye umutwe w\'akazi nk\'insanganyamatsiko.'}
      </p>

      <div className="careers-grid">
        {JOBS.map((job, i) => (
          <div key={i} className="career-card gc" style={{ borderTop: '4px solid var(--green)', cursor: 'pointer', transition: '.2s' }}
            onClick={() => setOpen(open === i ? null : i)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: 'var(--green-l)', color: 'var(--green)', borderRadius: 100, padding: '2px 10px', fontSize: 10, fontWeight: 700 }}>{job.dept}</span>
                  <span style={{ background: 'var(--bg)', borderRadius: 100, padding: '2px 10px', fontSize: 10, fontWeight: 600, color: 'var(--text2)' }}>{job.type}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {job.location}
                  </span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ transform: open === i ? 'rotate(90deg)' : 'none', transition: '.2s', flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>

            {open === i && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14 }}>
                  {lang === 'en'
                    ? `We're looking for a talented ${job.title} to join our ${job.dept} team and help build RECYX - Rwanda's leading circular economy platform.`
                    : `Dushaka ${job.title} w'inzobere kwinjira mu itsinda ryacu ry'${job.dept} no gufasha kubaka RECYX.`}
                </p>
                <a href={`mailto:careers@recyx.rw?subject=Application: ${job.title}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--green)', color: '#fff', borderRadius: 100, padding: '9px 20px', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: '.2s' }}>
                  {t.btn.applyNow}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="al-i" style={{ marginTop: 32, borderRadius: 14, padding: '18px 20px' }}>
        <strong>{lang === 'en' ? 'Don\'t see the right role?' : 'Ntubone inshingano ikwiye?'}</strong>
        {' '}
        {lang === 'en'
          ? 'We welcome speculative applications from talented individuals passionate about environmental technology.'
          : 'Twakirira ibyifuzo by\'abantu bafite ubushobozi bafite ubushake mu tekinoloji y\'ibidukikije.'}
        {' '}
        <a href="mailto:careers@recyx.rw" style={{ color: 'var(--green)', fontWeight: 600 }}>careers@recyx.rw</a>
      </div>
    </div>
  );
}
