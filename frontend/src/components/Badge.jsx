import React from 'react';
import { MATERIAL_COLORS, STATUS_COLORS } from '../data/demoData';

// Displays a colored pill badge based on the material type (e.g. plastic, metal)
export function MaterialBadge({ material }) {
  // Look up bg and text color by material name, fall back to grey if not found
  const [bg, color] = MATERIAL_COLORS[material] || ['#f3f4f6', '#6b7280'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color, borderRadius: 100, padding: '3px 10px',
      fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
    }}>
      {material}
    </span>
  );
}

// Displays a colored pill badge for a listing/offer status
export function StatusBadge({ status }) {
  // Look up bg and text color by status key, fall back to grey if not found
  const [bg, color] = STATUS_COLORS[status] || ['#f3f4f6', '#6b7280'];

  // Maps raw status keys to human-readable labels
  const labels = {
    available: 'Available', pending: 'Pending', pending_review: 'Under Review',
    accepted: 'Accepted', countered: 'Countered', declined: 'Declined',
    rejected: 'Rejected', in_transit: 'In Transit', completed: 'Completed',
    verified: 'Verified',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color, borderRadius: 100, padding: '3px 10px',
      fontSize: 11, fontWeight: 700,
    }}>
      {/* Show the friendly label, or fall back to the raw status string */}
      {labels[status] || status}
    </span>
  );
}

// Displays a colored pill badge for a user's role
export function RoleBadge({ role }) {
  // Each role has its own bg and text color pair
  const map = {
    admin: ['#fde68a', '#92400e'],
    technician: ['#dbeafe', '#1e40af'],
    recycler: ['#d1fae5', '#065f46'],
    citizen: ['#ede9fe', '#5b21b6'],
    buyer: ['#fce7f3', '#9d174d'],
  };
  const [bg, color] = map[role] || ['#f3f4f6', '#6b7280']; // fallback to grey
  const labels = { admin: 'Admin', technician: 'Technician', recycler: 'Recycler', citizen: 'Citizen', buyer: 'Buyer' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bg, color, borderRadius: 100, padding: '3px 11px',
      fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
    }}>
      {labels[role] || role}
    </span>
  );
}

// Generic reusable badge — accepts colors directly as props instead of looking them up
export default function Badge({ text, colors, children, bg, color }) {
  // Resolve background: prefer explicit bg prop, then colors array, then grey default
  const bgVal = bg || (colors && colors[0]) || '#f3f4f6';
  // Resolve text color: prefer explicit color prop, then colors array, then grey default
  const colorVal = color || (colors && colors[1]) || '#6b7280';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bgVal, color: colorVal, borderRadius: 100,
      padding: '3px 10px', fontSize: 11, fontWeight: 700,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>
      {/* Support both a text prop and child elements for flexibility */}
      {text || children}
    </span>
  );
}