import React, { useState } from 'react';
import { useLang } from '../context/LangContext';

const SECTIONS = [
  {
    num: "1",
    title: "Acceptance of Terms",
    body: "By accessing or using the RECYX platform (recyx.rw), you agree to be bound by these Terms of Service and our Privacy Policy. These Terms apply to all users of the platform including citizens, buyers, technicians, recyclers, and administrators. If you do not agree to these Terms, you may not use RECYX. These Terms constitute a legally binding agreement under the laws of the Republic of Rwanda."
  },
  {
    num: "2",
    title: "Eligibility & Account Registration",
    body: "You must be at least 18 years old to create a RECYX account. By registering, you confirm that all information provided is accurate, complete, and current. Technicians and recyclers must complete email verification and receive explicit approval from a RECYX administrator before accessing full platform features. You are responsible for maintaining the security of your account credentials and must notify us immediately of any unauthorized access. RECYX reserves the right to suspend or terminate accounts that violate these terms or involve fraudulent registration."
  },
  {
    num: "3",
    title: "Listing Rules & Admin Approval",
    body: "All material listings must be submitted for admin review before publication on the marketplace. Listings must accurately describe the material type, quantity, condition, and include clear photographs. Listings must comply with Rwandan environmental regulations, REMA guidelines, and the National E-Waste Policy. Hazardous materials must be clearly labeled. Listings of illegal, stolen, or prohibited materials will be removed and the account suspended. RECYX reserves the right to reject or remove any listing that violates these guidelines."
  },
  {
    num: "4",
    title: "Counter-Offer Marketplace Rules",
    body: "RECYX provides a counter-offer negotiation system. Buyers may propose initial prices; sellers may accept, decline, or counter-offer. Counter-offers may be negotiated until both parties reach agreement. All offers are non-binding until both parties formally confirm acceptance through the platform. Once an offer is accepted: both parties are obligated to complete the transaction in good faith within a reasonable timeframe. Repeated failures to honor accepted offers will result in account warnings or suspension. RECYX does not guarantee prices, availability, or material quality."
  },
  {
    num: "5",
    title: "Payment Terms (MTN MoMo / Airtel Money)",
    body: "RECYX supports payment exclusively via MTN Mobile Money (MoMo) and Airtel Money. Sellers specify their preferred payment method and account number when accepting an offer. Buyers send payment directly to the seller's specified account - RECYX does not process, hold, escrow, or guarantee any payments. Users are responsible for ensuring correct payment details before transferring funds. Payment disputes must first be addressed between the parties. RECYX may assist in mediation but accepts no financial liability. MTN and Airtel are independent third-party services subject to their own terms."
  },
  {
    num: "6",
    title: "Technician Services & Verification",
    body: "RECYX verifies technician identity and approves accounts, but does not certify skill level or guarantee work quality. Verification confirms identity, not competence. Service quality, pricing, and completion are solely the technician's responsibility. Clients are encouraged to review technician ratings, reviews, and completed job count before booking. RECYX may conduct in-person verification visits at its discretion. Technicians found to misrepresent their qualifications will be permanently removed. Disputes between clients and technicians should be resolved directly; RECYX may assist in mediation."
  },
  {
    num: "7",
    title: "Reviews & Ratings",
    body: "Users may leave reviews only after a genuine completed interaction (purchase, sale, or repair service). Reviews must be honest, factual, and based on direct experience. One review is permitted per transaction. RECYX reserves the right to remove reviews that are: false or misleading, abusive, harassing or threatening, spam or promotional, or suspected to be compensated/incentivized. Artificially inflating or deflating ratings - including creating fake accounts to review - will result in immediate account termination."
  },
  {
    num: "8",
    title: "Prohibited Activities",
    body: "Users must not: post fraudulent, misleading, or duplicate listings; use the platform for money laundering or financing prohibited activities; harass, threaten, or abuse other users; attempt to move transactions off-platform after initial contact to avoid RECYX oversight; collect user data by scraping or automated tools; reverse engineer, decompile, or copy RECYX's technology; impersonate RECYX staff or other users; create multiple accounts to circumvent suspensions; or use RECYX in any way that violates Rwandan law or international regulations."
  },
  {
    num: "9",
    title: "Intellectual Property",
    body: "The RECYX platform - including its design, code, brand identity, logo, and all original content - is the intellectual property of Team 7 / RECYX, developed at African Leadership University, and is protected under Rwandan intellectual property law. Users retain ownership of content they post (listings, photos, reviews) but grant RECYX a non-exclusive, royalty-free, worldwide license to display, reproduce, and distribute such content on the platform. This license ends when content is deleted, subject to legal retention obligations."
  },
  {
    num: "10",
    title: "Liability & Governing Law (Rwanda)",
    body: "RECYX is provided as-is during the current pilot phase. To the maximum extent permitted by Rwandan law, RECYX is not liable for: repair quality or outcomes, listing accuracy, transaction losses or disputes, service interruptions or data loss, actions of MTN or Airtel, or any indirect, incidental, or consequential damages. Our maximum aggregate liability to any user is limited to fees paid to RECYX (currently zero during the pilot). These Terms are governed by the laws of the Republic of Rwanda. Any legal proceedings must be filed in the courts of Kigali, Rwanda. For dispute resolution, users must first attempt resolution via the platform, then by emailing disputes@recyx.rw. If unresolved, disputes proceed to arbitration in Kigali per Rwandan arbitration law. RECYX may amend these Terms with 14 days' email notice. Continued use after the effective date constitutes acceptance. Legal enquiries: legal@recyx.rw - RECYX, Team 7, African Leadership University, Kigali Innovation City, Gasabo, Kigali, Rwanda."
  },
];

export default function TermsPage() {
  const { lang } = useLang();
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="pg pi">
        <div className="pg-h">
          <h1 className="pg-t">{lang === 'en' ? 'Terms of Service' : 'Amabwiriza y\'Imikoreshereze'}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            {lang === 'en' ? 'Effective: March 1, 2026 · Updated: March 15, 2026 · RECYX, African Leadership University' : 'Itangiye: Werurwe 1, 2026 · Ivuguruwe: Werurwe 15, 2026 · RECYX, African Leadership University'}
          </p>
        </div>

        <div className="al-w" style={{ borderRadius: 14, padding: '14px 18px', marginBottom: 28, fontSize: 13 }}>
          {lang === 'en'
            ? 'Please read these Terms carefully. By using RECYX, you agree to be legally bound by these Terms under the laws of Rwanda.'
            : 'Nyamuneka soma neza aya Mabwiriza. Gukomeza gukoresha RECYX bivuze ko wemera gukorerwa n\'aya mabwiriza hakurikijwe amategeko y\'u Rwanda.'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SECTIONS.map((s, i) => (
            <div key={i} className="gc" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '18px 22px', background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 8, background: expanded === i ? 'var(--green)' : 'var(--green-l)', color: expanded === i ? '#fff' : 'var(--green)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: '.2s' }}>
                  {s.num}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{s.title}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: expanded === i ? 'rotate(90deg)' : 'none', transition: '.2s', flexShrink: 0, color: 'var(--text2)' }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              {expanded === i && (
                <div style={{ padding: '0 22px 20px 62px' }}>
                  <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>{s.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, padding: '20px', background: 'var(--bg2)', borderRadius: 14, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
            {lang === 'en' ? 'Questions about these Terms?' : 'Ufite ibibazo ku Mabwiriza?'}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', fontSize: 13 }}>
            <a href="mailto:legal@recyx.rw" style={{ color: 'var(--green)', fontWeight: 700 }}>legal@recyx.rw</a>
            <span style={{ color: 'var(--border)' }}>|</span>
            <a href="mailto:disputes@recyx.rw" style={{ color: 'var(--blue)', fontWeight: 700 }}>disputes@recyx.rw</a>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 10 }}>
            RECYX · Team 7 · African Leadership University · Kigali Innovation City · Gasabo, Kigali, Rwanda
          </p>
        </div>
    </div>
  );
}