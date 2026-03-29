import React, { useEffect } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'var(--green)', icon: '✓' },
    error: { bg: 'var(--red)', icon: '✕' },
    info: { bg: 'var(--blue)', icon: 'i' },
    warning: { bg: 'var(--amber)', icon: '!' },
  };
  const c = colors[type] || colors.info;

  return (
    <div className="toast" role="alert" style={{ '--toast-color': c.bg }}>
      <span className="toast-icon" style={{
        width: 26, height: 26, borderRadius: '50%', background: c.bg,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, flexShrink: 0,
      }}>{c.icon}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text2)', fontSize: 16, lineHeight: 1, padding: '0 2px',
      }}>✕</button>
    </div>
  );
}
