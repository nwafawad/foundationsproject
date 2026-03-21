import React from 'react';
import { useLang } from '../context/LangContext';

const SECTIONS = [
  {
    num: "1",
    en: { title: "Information We Collect", body: "We collect the following personal information to provide RECYX services: (a) Account data: full name, email address, phone number, sector and district location; (b) Role-specific data: technicians provide specialization and experience details; recyclers provide company name and registration; (c) Transaction data: offer amounts, payment method preferences (not actual payment credentials), and transaction history; (d) Activity data: listings created, offers made, reviews given, and service requests; (e) Device data: browser type, IP address, and approximate location for map features." },
    rw: { title: "Amakuru Tukusanya", body: "Dukusanya amakuru akurikira kugirango dutange serivisi za RECYX: (a) Makuru ya konti: amazina yuzuye, aderesi ya email, nimero ya telefoni, akagari n'akarere; (b) Makuru y'inshingano: abatekinsiye batanga inzobere n'uburambe; abasubiramo imyanda batanga izina ry'ikigo; (c) Makuru y'ubucuruzi: ingano z'ibiciro, uburyo bwo kwishyura, n'amateka y'ubucuruzi; (d) Makuru y'ibikorwa: amatangazo yakozwe, ibiciro bytanzwe, ibitekerezo byatanzwe; (e) Makuru y'igikoresho: ubwoko bwa browser, aderesi ya IP." }
  },
  {
    num: "2",
    en: { title: "How We Use Your Information", body: "Your information is used to: (1) Provide and improve the RECYX platform and matching services; (2) Verify identity through admin approval for technicians and recyclers; (3) Send account notifications, offer alerts, and transaction updates; (4) Enable location-based features like the recycling facility map; (5) Analyze platform usage to improve the user experience; (6) Comply with Rwandan data protection laws and REMA environmental reporting obligations; (7) Prevent fraud and enforce our Terms of Service." },
    rw: { title: "Uburyo Dukoresha Amakuru Yawe", body: "Amakuru yawe akoreshwa kugirango: (1) Gutanga no kunoza serivisi za RECYX; (2) Emeza indangamuntu binyuze mu kwemezwa n'umuyobozi; (3) Kohereza imenyesha ya konti, imenyesha y'ibiciro, n'amakuru y'ubucuruzi; (4) Gukoresha ibikorwa bikurikirana ahantu nka ikarita y'aho imyanda yoherezwa; (5) Gusesengura imikoreshereze y'urubuga kunoza ubunararibonye bw'umukoresheje; (6) Kubahiriza amategeko y'ibanga rya Rwanda na REMA; (7) Guhagarika uburiganya no gushyira mu bikorwa Amabwiriza y'Imikoreshereze yacu." }
  },
  {
    num: "3",
    en: { title: "Data Storage & Security", body: "We take security seriously: Passwords are hashed with bcrypt (cost factor 12) - we never store plaintext passwords. Data is transmitted over HTTPS/TLS encryption. JWT authentication tokens expire after 12 hours. Sensitive data is stored in environment variables, not in code. Regular security audits are conducted. Data is stored in servers located in Africa where possible, compliant with Rwandan data sovereignty requirements. In the event of a data breach, affected users will be notified within 72 hours." },
    rw: { title: "Kubika Amakuru n'Umutekano", body: "Tugira igihe kinini ku mutekano: Amagambo banga asanozwa na bcrypt (cost factor 12) - ntidushyira nta gucunyura. Amakuru oherezwa hejuru ya HTTPS/TLS encryption. Ingingo za JWT zira hashize amasaha 12. Amakuru y'ibanga abitswe mu variables z'ibidukikije. Isuzumwa ry'umutekano rikorwa buri gihe. Amakuru abitswe mu maseva ari muri Afurika aho bishoboka, akurikiza ibisabwa by'u Rwanda ku busugire bw'amakuru. Iyo habaye akaga k'amakuru, abakoresheje bazamenyeshwa mu masaa 72." }
  },
  {
    num: "4",
    en: { title: "Data Sharing", body: "We do not sell, rent, or trade your personal data. Data may be shared: (a) With other users only as needed for the service (e.g., your name and sector visible to offer counterparts); (b) With service providers who help us operate the platform under strict confidentiality; (c) With government authorities (REMA, RDB) if required by Rwandan law; (d) Anonymized, aggregated data may be shared with research partners for environmental impact measurement. We never share your payment details with other users - only the method and number you provide for receiving payment." },
    rw: { title: "Gusangira Amakuru", body: "Nta makuru yawe y'ibintu tugurisha, tutaza cyangwa kugurishanya. Amakuru ashobora gusangirwa: (a) N'abandi bakoresheje gusa nk'uko bisabwa na serivisi; (b) N'abantu bafasha gutwara urubuga mu ibanga rikomeye; (c) N'inzego za leta (REMA, RDB) niba bisabwa n'amategeko y'u Rwanda; (d) Amakuru yandaguye adafite amazina ashobora gusangirwa n'inshuti z'ubushakashatsi. Ntidushyikiranya amakuru yawe y'ubwishyu n'abandi bakoresheje." }
  },
  {
    num: "5",
    en: { title: "Your Rights", body: "Under Rwandan data protection law (Law No. 058/2021), you have the right to: (1) Access - request a copy of all personal data we hold about you; (2) Correction - request we correct inaccurate information; (3) Deletion - request we delete your account and associated data (subject to legal retention obligations); (4) Portability - request your data in a portable format (JSON/CSV); (5) Objection - object to certain processing activities; (6) Withdraw consent - at any time without affecting past processing. To exercise these rights, email privacy@recyx.rw." },
    rw: { title: "Uburenganzira Bwawe", body: "Hakurikijwe amategeko y'ibanga rya Rwanda (Itegeko No. 058/2021), ufite uburenganzira bw': (1) Kubona - gusaba kopi y'amakuru yose yawe; (2) Gutunga - gusaba ko dutunga amakuru atari ya nyakuri; (3) Gusiba - gusaba ko dusiba konti yawe n'amakuru ashamikiyeho; (4) Kubwira - gusaba amakuru yawe mu buryo bwanduye; (5) Guhakanira - guhakanira inzira zimwe zo gucunga; (6) Gukurura imfura - igihe icyo ari cyo cyose. Kohereza email privacy@recyx.rw kugirango ukoreshe uburenganzira bwawe." }
  },
  {
    num: "6",
    en: { title: "Cookies", body: "RECYX uses minimal cookies: (a) Essential cookies: authentication tokens (JWT) stored securely, language preferences, and theme settings. These are strictly necessary and cannot be disabled; (b) We do NOT use tracking cookies, advertising cookies, or third-party analytics cookies (no Google Analytics, Facebook Pixel, etc.); (c) Session data is stored in your browser's localStorage for performance. You can clear this in your browser settings at any time without affecting your account." },
    rw: { title: "Ibikoresho by'Ubushyuhe (Cookies)", body: "RECYX ikoresha cookies nkeya cyane: (a) Cookies z'ingenzi: ingingo zo kwemeza (JWT) zibitswe mu mutekano, amahitamo y'ururimi, n'igenamiterere. Izi ni ngombwa kandi ntishobora gufungwa; (b) Ntigikoresha cookies zo gukurikirana, cookies zo gutangaza, cyangwa analytics cookies z'impande ya gatatu; (c) Amakuru y'ibikorwa abitswe mu localStorage ya browser yawe. Ushobora gusiba ibi mu makurubarantabira y'imashini yawe igihe icyo ari cyo cyose." }
  },
  {
    num: "7",
    en: { title: "Children's Privacy", body: "RECYX is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe a child under 18 has provided us with personal information, please contact us at privacy@recyx.rw and we will delete the information promptly." },
    rw: { title: "Ibanga ry'Abana", body: "RECYX ntiri iteganyirizwa abakoresheje bari munsi y'imyaka 18. Ntidukusanya amakuru y'abana tubimenye. Niba ugira icyo ukeka ko umwana uri munsi y'imyaka 18 atugezaho amakuru ye, twandikire kuri privacy@recyx.rw hanyuma dusibe amakuru byihuse." }
  },
  {
    num: "8",
    en: { title: "Data Protection Officer & Contact", body: "RECYX Data Protection Officer (DPO): Methode Duhujubumwe - privacy@recyx.rw. For general privacy inquiries: privacy@recyx.rw. RECYX, Team 7, African Leadership University, Kigali Innovation City, Gasabo District, Kigali, Rwanda. This policy was last updated: March 2026. We will notify you of significant changes via email." },
    rw: { title: "Ushinzwe Kurinda Amakuru n'Aho Tugeraho", body: "Ushinzwe Kurinda Amakuru (DPO) wa RECYX: Methode Duhujubumwe - privacy@recyx.rw. Ku bibazo by'ibanga rusange: privacy@recyx.rw. RECYX, Itsinda 7, African Leadership University, Kigali Innovation City, Akarere ka Gasabo, Kigali, Rwanda. Iyi politiki ivuguruwe umuheruka: Werurwe 2026." }
  },
];

export default function PrivacyPage() {
  const { lang } = useLang();

  return (
    <div className="pg pi">
        <div className="pg-h">
          <h1 className="pg-t">{lang === 'en' ? 'Privacy Policy' : 'Politiki y\'Ibanga'}</h1>
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
            {lang === 'en' ? 'Last updated: March 2026 · RECYX, Team 7, African Leadership University' : 'Ivuguruwe umuheruka: Werurwe 2026 · RECYX, Itsinda 7, African Leadership University'}
          </p>
        </div>

        <div className="al-i" style={{ borderRadius: 14, padding: '14px 18px', marginBottom: 28, fontSize: 13 }}>
          {lang === 'en'
            ? 'RECYX is committed to protecting your privacy and complying with Rwandan data protection law (Law No. 058/2021). This policy explains what data we collect, why, and how you can control it.'
            : 'RECYX iriheze kurinda ibanga ryawe no kubahiriza amategeko y\'ibanga rya Rwanda (Itegeko No. 058/2021). Iyi politiki isobanura amakuru dukusanya, impamvu, n\'uburyo ushobora ayigenzura.'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {SECTIONS.map((s, i) => {
            const content = s[lang] || s.en;
            return (
              <div key={i} className="gc content-section" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--green-l)', color: 'var(--green)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    {s.num}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>{content.title}</h2>
                    <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.75 }}>{content.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text3)' }}>
          {lang === 'en' ? 'Questions about privacy?' : 'Ufite ibibazo ku banga?'}{' '}
          <a href="mailto:privacy@recyx.rw" style={{ color: 'var(--green)', fontWeight: 700 }}>privacy@recyx.rw</a>
        </div>
    </div>
  );
}