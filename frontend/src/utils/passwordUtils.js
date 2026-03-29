export function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Number');
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) errors.push('Special character');
  return { valid: errors.length === 0, errors };
}

export function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) score++;
  const levels = [
    { level: 0, label: '', color: '' },
    { level: 1, label: 'Weak', color: '#ef4444' },
    { level: 2, label: 'Fair', color: '#f59e0b' },
    { level: 3, label: 'Good', color: '#3b82f6' },
    { level: 4, label: 'Strong', color: '#22c55e' },
    { level: 5, label: 'Very Strong', color: '#16a34a' },
  ];
  return levels[Math.min(score, 5)];
}
