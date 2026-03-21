import emailjs from '@emailjs/browser';

// ─── Configuration ─────────────────────────────────────────────────────────────
// All sensitive keys are read from environment variables; empty strings are safe
// fallbacks that trigger "demo mode" (console logs instead of real emails)
const SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
const PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'm.duhujubum@alustudent.com';

// Maps logical email types to EmailJS template IDs (overridable via env vars)
const TEMPLATES = {
  verification: process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE || 'template_verification',
  adminNotify:  process.env.REACT_APP_EMAILJS_ADMIN_NOTIFY_TEMPLATE  || 'template_admin_notify',
  approval:     process.env.REACT_APP_EMAILJS_APPROVAL_TEMPLATE      || 'template_approval',
  transaction:  process.env.REACT_APP_EMAILJS_TRANSACTION_TEMPLATE   || 'template_transaction',
};

// ─── Lazy initialisation ────────────────────────────────────────────────────────
// EmailJS only needs to be initialised once with the public key; this flag
// prevents redundant calls if multiple emails are sent in the same session
let initialized = false;
function init() {
  if (!initialized && PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
    initialized = true;
  }
}

// ─── Email senders ──────────────────────────────────────────────────────────────
// All functions follow the same pattern:
//   1. Call init() to ensure EmailJS is ready
//   2. If SERVICE_ID is missing, log to console and return success (demo mode)
//   3. Otherwise send the email via EmailJS and return { success: true/false }

// Sends a 6-digit OTP to a user during registration or login verification
export async function sendVerificationCode(email, name, code) {
  init();
  if (!SERVICE_ID) {
    // Demo mode: print the code to the console so it can still be used without EmailJS
    console.log(`[DEMO] Verification code ${code} → ${email}`);
    return { success: true, demo: true };
  }
  try {
    await emailjs.send(SERVICE_ID, TEMPLATES.verification, {
      to_email: email, to_name: name, verification_code: code,
      message: `Your RECYX verification code is: ${code}. Expires in 10 minutes.`,
    });
    return { success: true };
  } catch (err) { return { success: false, error: err.text }; }
}

// Alerts the admin when a new technician or recycler registers and needs approval
export async function notifyAdminNewAccount(userData) {
  init();
  const data = {
    to_email: ADMIN_EMAIL, to_name: 'RECYX Admin',
    user_name: userData.name, user_email: userData.email, user_role: userData.role,
    user_sector: userData.sector,
    speciality: userData.spec || userData.company || 'N/A', // technicians have spec; recyclers have company
    message: `New ${userData.role} registration: ${userData.name} (${userData.email}) requires approval.`,
    action_url: window.location.origin, // deep-link back to the admin dashboard
  };
  if (!SERVICE_ID) { console.log('[DEMO] Admin notified:', data.message); return { success: true }; }
  try { await emailjs.send(SERVICE_ID, TEMPLATES.adminNotify, data); return { success: true }; }
  catch (err) { return { success: false }; }
}

// Emails the user the outcome of their account review (approved or rejected)
export async function sendApprovalEmail(email, name, approved, reason = '') {
  init();
  // Build a contextual message based on the outcome
  const msg = approved
    ? `Congratulations ${name}! Your RECYX account has been approved. Login at ${window.location.origin}`
    : `Hello ${name}, your application was not approved. ${reason || 'Contact support.'}`;
  if (!SERVICE_ID) { console.log(`[DEMO] ${approved ? 'Approval' : 'Rejection'} → ${email}`); return { success: true }; }
  try {
    await emailjs.send(SERVICE_ID, TEMPLATES.approval, {
      to_email: email, to_name: name,
      status: approved ? 'APPROVED' : 'REJECTED', // used by the email template for conditional styling
      message: msg,
    });
    return { success: true };
  }
  catch (err) { return { success: false }; }
}

// Sends a transactional email for offer/payment events (e.g. offer accepted, payment confirmed)
// txData shape: { listingTitle, type, fromName, amount, message }
export async function sendTransactionEmail(email, name, txData) {
  init();
  if (!SERVICE_ID) { console.log(`[DEMO] Transaction email → ${email}:`, txData); return { success: true }; }
  try {
    await emailjs.send(SERVICE_ID, TEMPLATES.transaction, {
      to_email: email, to_name: name,
      listing_title: txData.listingTitle,
      action_type: txData.type,       // e.g. "offer_accepted", "payment_confirmed"
      from_name: txData.fromName,
      amount: txData.amount?.toLocaleString() + ' RWF',
      message: txData.message,
    });
    return { success: true };
  }
  catch (err) { return { success: false }; }
}

// Alerts the admin when a new listing is submitted and requires content review
export async function notifyAdminNewListing(listing, userName) {
  init();
  const msg = `New listing: "${listing.title}" (${listing.material}, ${listing.qty}kg) by ${userName} - needs review.`;
  if (!SERVICE_ID) { console.log('[DEMO] Admin listing notify:', msg); return { success: true }; }
  try {
    await emailjs.send(SERVICE_ID, TEMPLATES.adminNotify, {
      to_email: ADMIN_EMAIL, to_name: 'RECYX Admin',
      message: msg,
      action_url: window.location.origin,
    });
    return { success: true };
  }
  catch (err) { return { success: false }; }
}