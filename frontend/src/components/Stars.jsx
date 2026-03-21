import React from 'react';

// Renders a row of 5 stars reflecting a numeric rating (supports half stars)
export default function Stars({ rating, size = 11, showNum = false }) {

  // Classify each of the 5 star positions as full, half, or empty
  const stars = [1, 2, 3, 4, 5].map(i => {
    if (rating >= i) return 'full';
    if (rating >= i - 0.5) return 'half';
    return 'empty';
  });

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}>
      {stars.map((type, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <defs>
            {/* Gradient that fills the left 50% amber and leaves the right 50% transparent — used for half stars */}
            <linearGradient id={`half-${i}-${size}`}>
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="none" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            // Full → solid amber fill, half → left-half gradient, empty → no fill (outline only)
            fill={type === 'full' ? '#f59e0b' : type === 'half' ? `url(#half-${i}-${size})` : 'none'}
            stroke="#f59e0b"
            strokeWidth="1.5"
          />
        </svg>
      ))}

      {/* Optionally show the numeric rating value next to the stars */}
      {showNum && (
        <span style={{ fontSize: size, fontWeight: 700, color: '#f59e0b', marginLeft: 3 }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}