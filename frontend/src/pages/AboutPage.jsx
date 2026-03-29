import React from 'react';
import { useLang } from '../context/LangContext';
import T from '../data/translations';

const TEAM = [
  { name: "Keira Mutoni", role: "Project Manager", avatar: "KM", color: "#16a34a" },
  { name: "Nawaf Ahmed", role: "Backend Developer", avatar: "NA", color: "#0ea5e9" },
  { name: "Sylivie Tumukunde", role: "Frontend Developer", avatar: "ST", color: "#7c3aed" },
  { name: "Methode Duhujubumwe", role: "Full-Stack Developer", avatar: "MD", color: "#f59e0b" },
  { name: "Rhoda Umutesi", role: "UX/UI Designer", avatar: "RU", color: "#ec4899" },
  { name: "Cindy Teta", role: "Research & Impact", avatar: "CT", color: "#0ea5e9" },
];

const SDGs = [
  { num: 9, title: "Industry, Innovation & Infrastructure", color: "#fd6925" },
  { num: 11, title: "Sustainable Cities & Communities", color: "#fd9d24" },
  { num: 12, title: "Responsible Consumption & Production", color: "#bf8b2e" },
  { num: 13, title: "Climate Action", color: "#3f7e44" },
];

export default function AboutPage({ navigate }) {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <div className="pg pi">
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(22,163,74,.08), rgba(14,165,233,.06))',
        borderRadius: 24, padding: '48px 40px', marginBottom: 40, textAlign: 'center',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
            <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
            <path d="m14 16-3 3 3 3" />
            <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
            <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.02 3a1.784 1.784 0 0 1 1.572.89l3.468 6.004" />
            <path d="m18.186 12.7 1.096 4.096 4.096-1.098" />
          </svg>
          <span style={{ fontSize: 28, fontWeight: 900, background: 'linear-gradient(135deg,var(--green),var(--blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RECYX</span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px,4vw,38px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: 12 }}>
          {lang === 'en' ? 'Transforming Rwanda\'s Circular Economy' : 'Guhindura Ubukungu bw\'Imyanda mu Rwanda'}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
          {lang === 'en'
            ? 'A digital platform connecting citizens, technicians, and recyclers across all 30 districts of Rwanda - built by Team 7 at African Leadership University.'
            : 'Urubuga rwa dijitali rubuhuje abatuye, abatekinsiye, n\'abasubiramo imyanda mu turere twose 30 tw\'u Rwanda - rwubakwa na Itsinda 7 i African Leadership University.'}
        </p>
      </div>

      {/* Mission & Vision */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
        <div className="gc content-section">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
            {lang === 'en' ? 'Our Mission' : 'Intego Yacu'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            {lang === 'en'
              ? 'To transform Rwanda\'s circular economy through technology - making repair, recycling, and material trading accessible to every citizen in every district.'
              : 'Guhindura ubukungu bw\'imyanda mu Rwanda binyuze muri tekinoloji - gukoresha gusana, gusubiramo imyanda, no kugurisha ibikoresho bijyanywa na buri muturage mu turere twose.'}
          </p>
        </div>
        <div className="gc content-section">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
            {lang === 'en' ? 'Our Vision' : 'Iyerekwa Ryacu'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            {lang === 'en'
              ? 'A Rwanda where no electronic device or recyclable material goes to waste - and where every repair or recycling transaction creates economic value and environmental impact.'
              : 'Rwanda aho nta gikoresho cyikoranabuhanga cyangwa ibikoresho bisubirwaho bigira imyanda - kandi aho ubucuruzi bwose bwo gusana cyangwa gusubiramo imyanda bwarema agaciro k\'ubukungu no kunezeza ibidukikije.'}
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="gc content-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14 }}>
          {lang === 'en' ? 'Our Story' : 'Inkuru Yacu'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 14 }}>
              {lang === 'en'
                ? 'RECYX was founded by Team 7 - a group of passionate innovators at African Leadership University (ALU) in Kigali. What started as a final-year project became a mission: to solve Rwanda\'s growing e-waste problem and democratize access to repair services.'
                : 'RECYX yashinzwe na Itsinda 7 - itsinda ry\'abantu bafite ubushake n\'ubushobozi i African Leadership University (ALU) i Kigali. Ibyo byatangiriye nk\'umushinga wa mwaka wo gusoza byabaye inzira: gukemura ikibazo cy\'imyanda y\'ikoranabuhanga iri kwiyongera no gutuma serivisi zo gusana zibonerana buri wese.'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>
              {lang === 'en'
                ? 'We observed that millions of kilograms of valuable recyclable materials were being lost to landfills, while thousands of citizens lacked access to affordable and trustworthy repair services. RECYX bridges that gap.'
                : 'Twabonye ko miliyoni z\'ibiro by\'ibikoresho bisubirwaho by\'agaciro bari bakuyemo, naho ibihumbi by\'abatuye batahari serivisi zo gusana zigura kandi zizwi. RECYX irahuza icyo gapfa.'}
            </p>
          </div>
          <div>
            <div className="al-s" style={{ borderRadius: 14, padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>10,000+</div>
              <div style={{ fontSize: 13 }}>{lang === 'en' ? 'tonnes of e-waste prevented from landfills' : 'toni z\'imyanda y\'ikoranabuhanga yambuwe imyobo'}</div>
            </div>
            <div className="al-i" style={{ borderRadius: 14, padding: 20, marginBottom: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>2,500+</div>
              <div style={{ fontSize: 13 }}>{lang === 'en' ? 'repairs facilitated across Rwanda' : 'amasanamu yagiye hose mu Rwanda'}</div>
            </div>
            <div style={{ background: 'var(--purple-l)', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--purple)', marginBottom: 4 }}>30</div>
              <div style={{ fontSize: 13, color: 'var(--purple)' }}>{lang === 'en' ? 'districts covered · Vision 2050 aligned' : 'turere twose · Vision 2050 ijyanye na We'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          {lang === 'en' ? 'Meet Team 7' : 'Menya Itsinda 7'}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 22 }}>
          {lang === 'en' ? 'African Leadership University · Kigali Innovation City, Rwanda' : 'African Leadership University · Kigali Innovation City, Rwanda'}
        </p>
        <div className="team-grid">
          {TEAM.map((m, i) => (
            <div key={i} className="team-member gc" style={{ textAlign: 'center', padding: '24px 18px' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', margin: '0 auto 14px',
                background: `linear-gradient(135deg, ${m.color}22, ${m.color}55)`, color: m.color,
                fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${m.color}33`,
              }}>
                {m.avatar}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SDG Alignment */}
      <div className="gc content-section" style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
          {lang === 'en' ? 'Aligned with the UN SDGs' : 'Ijyanye n\'Intego z\'UNDP'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 18 }}>
          {lang === 'en' ? 'RECYX directly contributes to Rwanda\'s progress on these Sustainable Development Goals.' : 'RECYX igira uruhare muri iterambere ry\'u Rwanda kuri izo Ntego z\'Iterambere Rirambye.'}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {SDGs.map(s => (
            <div key={s.num} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              background: `${s.color}15`, borderRadius: 12, border: `1px solid ${s.color}33`,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.color, color: '#fff', fontSize: 13, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.num}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color, maxWidth: 160 }}>{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
          {lang === 'en' ? 'Our Partners & Supporters' : 'Inshuti z\'Imirimo Yacu'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
          {lang === 'en' ? 'Proudly supported by Rwanda\'s leading institutions.' : 'Twashyigiwe n\'imiryango ikomeye y\'u Rwanda.'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>

          {/* ALU */}
          <div className="gc" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
              <img
                src="https://www.alueducation.com/wp-content/uploads/2016/02/alu_logo_original.png"
                alt="African Leadership University"
                style={{ maxWidth: '100%', maxHeight: 48, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', fontWeight: 900, fontSize: 22, color: '#1a1a2e', letterSpacing: '-1px' }}>ALU</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.4 }}>African Leadership University</div>
          </div>

          {/* FONERWA */}
          <div className="gc" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <img
                src="https://tse3.mm.bing.net/th/id/OIP.srEY4fCTHGAJPAzNTW_L0AAAAA?w=400&h=400&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Rwanda Green Fund"
                style={{ maxWidth: '100%', maxHeight: 48, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', fontWeight: 900, fontSize: 18, color: '#2d6a4f', letterSpacing: '-0.5px' }}>FONERWA</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.4 }}>Rwanda Green Fund</div>
          </div>

          {/* REMA */}
          <div className="gc" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
              <img
                src="https://tse1.mm.bing.net/th/id/OIP.5Bp7iI_VdsOt6R_DQu0AfAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="REMA"
                style={{ maxWidth: '100%', maxHeight: 48, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', fontWeight: 900, fontSize: 22, color: '#1a7a4a' }}>REMA</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.4 }}>Rwanda Environment Management Authority</div>
          </div>

          {/* Enviroserve Rwanda */}
          <div className="gc" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
              <img
                src="https://enviroserve.rw/wp-content/uploads/2020/06/cropped-websitelogo.png"
                alt="Enviroserve Rwanda"
                style={{ maxWidth: '100%', maxHeight: 48, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', fontWeight: 900, fontSize: 15, color: '#2e7d32', letterSpacing: '-0.5px' }}>ENVIROSERVE</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.4 }}>Enviroserve Rwanda</div>
          </div>

          {/* Ministry of Environment */}
          <div className="gc" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
              <img
                src="https://th.bing.com/th/id/R.ea93703a733e070c117d64df91c6aa92?rik=fnJDroYR2%2bAtMw&pid=ImgRaw&r=0"
                alt="Ministry of Environment"
                style={{ maxWidth: '100%', maxHeight: 48, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', fontWeight: 900, fontSize: 14, color: '#166534' }}>MINENV</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.4 }}>Ministry of Environment</div>
          </div>

          {/* Kepler College */}
          <div className="gc" style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <div style={{ width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 10, padding: '8px 12px', border: '1px solid var(--border)' }}>
              <img
                src="https://tse1.mm.bing.net/th/id/OIP.AHPhHjok3W-XgCd4cns3xAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Kepler College"
                style={{ maxWidth: '100%', maxHeight: 48, objectFit: 'contain' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', fontWeight: 900, fontSize: 16, color: '#1e3a5f' }}>KEPLER</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.4 }}>Kepler College</div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '32px 24px', background: 'linear-gradient(135deg,rgba(22,163,74,.08),rgba(14,165,233,.06))', borderRadius: 20 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
          {lang === 'en' ? 'Ready to Join RECYX?' : 'Witeguye kwinjira muri RECYX?'}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
          {lang === 'en' ? 'Create your free account and start contributing to Rwanda\'s circular economy today.' : 'Fungura konti yawe ubuntu ugatangira gutera inkunga ubukungu bw\'imyanda mu Rwanda uyu munsi.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-p" onClick={() => navigate('register')}>
            {lang === 'en' ? 'Create Free Account' : 'Fungura Konti Ubuntu'}
          </button>
          <button className="btn-g" onClick={() => navigate('contact')}>
            {lang === 'en' ? 'Contact Our Team' : 'Twandikire'}
          </button>
        </div>
      </div>
    </div>
  );
}
