import React, { useRef, useState } from 'react';

export default function ImageUploader({ images = [], onChange, maxImages = 6 }) {
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (files) => {
    setError('');
    const newImages = [...images];
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be under 5MB.');
        return;
      }
      if (newImages.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({ name: file.name, url: e.target.result });
        onChange && onChange([...newImages]);
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange && onChange(updated);
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <div
        className="upload-zone"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragging ? 'var(--green)' : 'rgba(0,0,0,.12)'}`,
          borderRadius: 14,
          padding: images.length ? 12 : 36,
          textAlign: 'center',
          color: 'var(--text3)',
          fontSize: 12,
          cursor: 'pointer',
          minHeight: 90,
          transition: '.2s',
          background: dragging ? 'rgba(22,163,74,.04)' : 'transparent',
        }}
      >
        {images.length === 0 ? (
          <>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }}>
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Click to upload or drag & drop photos</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>PNG, JPG, WebP - max 5MB each · up to {maxImages} images</div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {images.map((img, i) => (
              <div key={i} style={{
                position: 'relative', width: 76, height: 60,
                borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                border: '1px solid rgba(0,0,0,.08)',
              }}>
                <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={e => { e.stopPropagation(); remove(i); }}
                  style={{
                    position: 'absolute', top: 3, right: 3, width: 18, height: 18,
                    borderRadius: '50%', background: 'rgba(0,0,0,.65)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontSize: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  ✕
                </button>
              </div>
            ))}
            {images.length < maxImages && (
              <div style={{
                width: 76, height: 60, borderRadius: 10,
                border: '1.5px dashed rgba(0,0,0,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: 'var(--text3)', flexShrink: 0,
              }}>
                +
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 6, fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
}
