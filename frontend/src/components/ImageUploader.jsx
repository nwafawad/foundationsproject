import React, { useRef, useState } from 'react';

// Drag-and-drop + click-to-upload image input with preview thumbnails and removal
export default function ImageUploader({ images = [], onChange, maxImages = 6 }) {
  const fileRef = useRef(null); // ref to the hidden <input type="file"> element
  const [dragging, setDragging] = useState(false); // tracks whether a file is being dragged over the zone
  const [error, setError] = useState('');

  // Validates and converts selected files to base64 data URLs, then calls onChange
  const handleFiles = (files) => {
    setError('');
    const newImages = [...images];
    Array.from(files).forEach(file => {
      // Only accept image MIME types
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed.');
        return;
      }
      // Enforce 5MB size limit per file
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be under 5MB.');
        return;
      }
      // Stop if we've already hit the image cap
      if (newImages.length >= maxImages) {
        setError(`Maximum ${maxImages} images allowed.`);
        return;
      }
      // Read the file as a base64 data URL so it can be previewed without uploading
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({ name: file.name, url: e.target.result });
        onChange && onChange([...newImages]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Removes an image by index and notifies the parent via onChange
  const remove = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange && onChange(updated);
  };

  return (
    <div>
      {/* Hidden file input — triggered programmatically by clicking the drop zone */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* Clickable drop zone — handles both click-to-browse and drag-and-drop */}
      <div
        className="upload-zone"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragging ? 'var(--green)' : 'rgba(0,0,0,.12)'}`, // green border while dragging
          borderRadius: 14,
          padding: images.length ? 12 : 36, // less padding once thumbnails are showing
          textAlign: 'center',
          color: 'var(--text3)',
          fontSize: 12,
          cursor: 'pointer',
          minHeight: 90,
          transition: '.2s',
          background: dragging ? 'rgba(22,163,74,.04)' : 'transparent', // subtle green tint while dragging
        }}
      >
        {/* Empty state: show upload prompt and instructions */}
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
          // Filled state: render a thumbnail grid of uploaded images
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {images.map((img, i) => (
              <div key={i} style={{
                position: 'relative', width: 76, height: 60,
                borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                border: '1px solid rgba(0,0,0,.08)',
              }}>
                <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {/* Remove button — stopPropagation prevents the drop zone click from firing */}
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
            {/* Show a "+" placeholder slot if there's still room for more images */}
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

      {/* Validation error message shown below the drop zone */}
      {error && (
        <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 6, fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
}