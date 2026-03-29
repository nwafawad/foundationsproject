import React from 'react';
import { MATERIAL_COLORS, STATUS_COLORS } from '../data/demoData';

export function MaterialBadge({ material }) {
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

export function StatusBadge({ status }) {
  const [bg, color] = STATUS_COLORS[status] || ['#f3f4f6', '#6b7280'];
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
      {labels[status] || status}
    </span>
  );
}

export function RoleBadge({ role }) {
  const map = {
    admin: ['#fde68a', '#92400e'],
    technician: ['#dbeafe', '#1e40af'],
    recycler: ['#d1fae5', '#065f46'],
    citizen: ['#ede9fe', '#5b21b6'],
    buyer: ['#fce7f3', '#9d174d'],
  };
  const [bg, color] = map[role] || ['#f3f4f6', '#6b7280'];
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

export default function Badge({ text, colors, children, bg, color }) {
  const bgVal = bg || (colors && colors[0]) || '#f3f4f6';
  const colorVal = color || (colors && colors[1]) || '#6b7280';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: bgVal, color: colorVal, borderRadius: 100,
      padding: '3px 10px', fontSize: 11, fontWeight: 700,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>
      {text || children}
    </span>
  );
}
