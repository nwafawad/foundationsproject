import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import T from '../data/translations';
import { createListing as apiCreateListing } from '../utils/api';
import { sectorsByDistrict } from '../data/sectors';
import ImageUploader from '../components/ImageUploader';
import Toast from '../components/Toast';

const MATERIALS = ['electronics', 'plastic', 'metal', 'paper', 'glass', 'mixed'];
const CONDITIONS = ['functional', 'repairable', 'scrap'];

export default function CreateListingPage({ navigate }) {
  const { user } = useAuth();
  const { lang } = useLang();
  const t = T[lang];

  const [form, setForm] = useState({
    title: '', material: '', condition: '', qty: '', price: '',
    description: '', district: '', sector: '', paymentMethod: 'mtn', paymentNumber: '',
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (!user) {
    return (
      <div className="pg pi" style={{ textAlign: 'center', paddingTop: 60 }}>
        <h2 style={{ marginBottom: 16 }}>{lang === 'en' ? 'Login required' : 'Ugomba kwinjira'}</h2>
        <button className="btn-p" onClick={() => navigate('login')}>{t.btn.login}</button>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = t.errors.required;
    if (!form.material) e.material = t.errors.required;
    if (!form.condition) e.condition = t.errors.required;
    if (!form.qty || isNaN(form.qty)) e.qty = t.errors.required;
    if (!form.price || isNaN(form.price)) e.price = t.errors.required;
    if (!form.description.trim()) e.description = t.errors.required;
    if (!form.sector) e.sector = t.errors.required;
    if (!form.paymentNumber.trim()) e.paymentNumber = t.errors.required;
    if (images.length === 0) e.images = t.errors.noImage;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiCreateListing({
        sellerId: user.id,
        sellerName: user.name,
        title: form.title.trim(),
        material: form.material,
        condition: form.condition,
        qty: Number(form.qty),
        price: Number(form.price),
        description: form.description.trim(),
        sector: form.sector,
        paymentMethod: form.paymentMethod,
        paymentNumber: form.paymentNumber.trim(),
        image: images[0]?.url || '',
        images: images.map(i => i.url),
      });
      setLoading(false);
      setDone(true);
    } catch (err) {
      setLoading(false);
      setErrors({ submit: err?.message || 'Failed to submit listing. Please try again.' });
    }
  };

  if (done) {
    return (
      <div className="pg pi" style={{ textAlign: 'center', paddingTop: 40 }}>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--green-l)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
            {lang === 'en' ? 'Listing Submitted!' : 'Itangazo Ryoherejwe!'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28 }}>
            {t.success.listingCreated}
          </p>
          <div className="al-i" style={{ borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, textAlign: 'left' }}>
            <strong>{lang === 'en' ? 'What happens next:' : 'Ibi ni ibikorwa bikurikira:'}</strong>
            <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.8 }}>
              <li>{lang === 'en' ? 'Admin reviews your listing (24-48 hours)' : 'Umuyobozi arebesha itangazo ryawe (Amasaha 24-48)'}</li>
              <li>{lang === 'en' ? 'You get notified when it goes live' : 'Uzamenyeshwa igihe ritangajwe'}</li>
              <li>{lang === 'en' ? 'Buyers can then make offers' : 'Abagura bazashobora gutanga ibiciro'}</li>
            </ul>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-g" onClick={() => navigate('dashboard')}>{t.nav.dashboard}</button>
            <button className="btn-p" onClick={() => { setDone(false); setForm({ title: '', material: '', condition: '', qty: '', price: '', description: '', district: '', sector: '', paymentMethod: 'mtn', paymentNumber: '' }); setImages([]); }}>
              {lang === 'en' ? 'List Another' : 'Tangaza Ikindi'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pg pi">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="pg-h">
        <button className="btn-back" onClick={() => navigate('marketplace')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          {t.btn.back}
        </button>
        <h1 className="pg-t" style={{ marginTop: 12 }}>{t.pages.createListing}</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>
          {lang === 'en' ? 'Fill in the details below to list your recyclable material for review.' : 'Uzuza amakuru hasi kugirango utangaze ibikoresho by\'imyanda byawe kugirango bireberwe.'}
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="gc" style={{ padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              {lang === 'en' ? 'Material Details' : 'Amakuru y\'Ibikoresho'}
            </h3>

            <div className="fg">
              <label className="fl">{t.form.title} *</label>
              <input className="fi" value={form.title} onChange={e => set('title', e.target.value)} placeholder={lang === 'en' ? 'e.g. Office Desktop Computers - 5 units' : 'Urugero: Mudasobwa z\'Ibiro - 5'} />
              {errors.title && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.title}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fg">
                <label className="fl">{t.form.material} *</label>
                <select className="fs" value={form.material} onChange={e => set('material', e.target.value)}>
                  <option value="">{lang === 'en' ? 'Select material...' : 'Hitamo ubwoko...'}</option>
                  {MATERIALS.map(m => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{t.market.filters[m]}</option>)}
                </select>
                {errors.material && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.material}</p>}
              </div>

              <div className="fg">
                <label className="fl">{t.form.condition} *</label>
                <select className="fs" value={form.condition} onChange={e => set('condition', e.target.value)}>
                  <option value="">{lang === 'en' ? 'Select condition...' : 'Hitamo imiterere...'}</option>
                  <option value="functional">{lang === 'en' ? 'Functional' : 'Ikora'}</option>
                  <option value="repairable">{lang === 'en' ? 'Repairable' : 'Isanwa'}</option>
                  <option value="scrap">{lang === 'en' ? 'Scrap' : 'Imyanda'}</option>
                </select>
                {errors.condition && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.condition}</p>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fg">
                <label className="fl">{t.form.quantity} (kg) *</label>
                <input className="fi" type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="e.g. 150" min="0" />
                {errors.qty && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.qty}</p>}
              </div>

              <div className="fg">
                <label className="fl">{t.form.price} *</label>
                <input className="fi" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. 50000" min="0" />
                {errors.price && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.price}</p>}
              </div>
            </div>

            <div className="fg">
              <label className="fl">{t.form.description} *</label>
              <textarea className="fi" rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                placeholder={lang === 'en' ? 'Describe the material: source, condition details, any sorting done...' : 'Sobanura ibikoresho: inkomoko, imiterere, gutunga...'}
                style={{ resize: 'vertical' }} />
              {errors.description && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.description}</p>}
            </div>
          </div>

          <div className="gc" style={{ padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              {lang === 'en' ? 'Location' : 'Ahantu'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="fg">
                <label className="fl">{t.form.district} *</label>
                <select className="fs" value={form.district} onChange={e => { set('district', e.target.value); set('sector', ''); }}>
                  <option value="">{lang === 'en' ? 'Select district...' : 'Hitamo akarere...'}</option>
                  {Object.keys(sectorsByDistrict).sort().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {form.district && (
                <div className="fg">
                  <label className="fl">{t.form.sector} *</label>
                  <select className="fs" value={form.sector} onChange={e => set('sector', e.target.value)}>
                    <option value="">{lang === 'en' ? 'Select sector...' : 'Hitamo akagari...'}</option>
                    {sectorsByDistrict[form.district]?.map(s => <option key={s} value={`${s}, ${form.district}`}>{s}</option>)}
                  </select>
                  {errors.sector && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.sector}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="gc" style={{ padding: '24px 28px', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              {lang === 'en' ? 'Payment Preference' : 'Uburyo bwo Kwishyura'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {['mtn', 'airtel'].map(m => (
                <div key={m} onClick={() => set('paymentMethod', m)} style={{
                  padding: 16, borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: '.2s',
                  border: form.paymentMethod === m ? `2px solid ${m === 'mtn' ? '#FFCC00' : '#ED1C24'}` : '1px solid var(--border)',
                  background: form.paymentMethod === m ? (m === 'mtn' ? '#FFFDE7' : '#FFF5F5') : 'var(--bg2)',
                }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: m === 'mtn' ? '#FFCC00' : '#ED1C24' }}>{m === 'mtn' ? 'MTN' : 'Airtel'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{m === 'mtn' ? 'MoMo' : 'Money'}</div>
                </div>
              ))}
            </div>

            <div className="fg">
              <label className="fl">{form.paymentMethod === 'mtn' ? t.payment.mtnMomo : t.payment.airtelMoney} {lang === 'en' ? 'Number' : 'Nomero'} *</label>
              <input className="fi" value={form.paymentNumber} onChange={e => set('paymentNumber', e.target.value)}
                placeholder={form.paymentMethod === 'mtn' ? '078XXXXXXX' : '073XXXXXXX'} />
              {errors.paymentNumber && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errors.paymentNumber}</p>}
            </div>
          </div>

          <div className="gc" style={{ padding: '24px 28px', marginBottom: 28 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              {lang === 'en' ? 'Photos *' : 'Amafoto *'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
              {lang === 'en' ? 'Add clear photos of your material. Good photos attract more buyers.' : 'Ongeraho amafoto meza y\'ibikoresho byawe. Amafoto meza yegereza abagura benshi.'}
            </p>
            <ImageUploader images={images} onChange={setImages} maxImages={6} />
            {errors.images && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 8 }}>{errors.images}</p>}
          </div>

          {errors.submit && (
            <div className="al-d" style={{ marginBottom: 16, borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
              {errors.submit}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-g" style={{ flex: 1 }} onClick={() => navigate('marketplace')}>
              {t.btn.cancel}
            </button>
            <button type="submit" className="btn-sub" style={{ flex: 2 }} disabled={loading}>
              {loading ? (lang === 'en' ? 'Submitting...' : 'Ohereza...') : t.btn.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
