import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || '';
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || 'm.duhujubum@alustudent.com';

const TEMPLATES = {
  verification: process.env.REACT_APP_EMAILJS_VERIFICATION_TEMPLATE || 'template_verification',
  adminNotify: process.env.REACT_APP_EMAILJS_ADMIN_NOTIFY_TEMPLATE || 'template_admin_notify',
  approval: process.env.REACT_APP_EMAILJS_APPROVAL_TEMPLATE || 'template_approval',
  transaction: process.env.REACT_APP_EMAILJS_TRANSACTION_TEMPLATE || 'template_transaction',
};

let initialized = false;
function init() {
  if (!initialized && PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
    initialized = true;
  }
}

export async function sendVerificationCode(email, name, code) {
  init();
  if (!SERVICE_ID) {
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

export async function notifyAdminNewAccount(userData) {
  init();
  const data = {
    to_email: ADMIN_EMAIL, to_name: 'RECYX Admin',
    user_name: userData.name, user_email: userData.email, user_role: userData.role,
    user_sector: userData.sector, speciality: userData.spec || userData.company || 'N/A',
    message: `New ${userData.role} registration: ${userData.name} (${userData.email}) requires approval.`,
    action_url: window.location.origin,
  };
  if (!SERVICE_ID) { console.log('[DEMO] Admin notified:', data.message); return { success: true }; }
  try { await emailjs.send(SERVICE_ID, TEMPLATES.adminNotify, data); return { success: true }; }
  catch (err) { return { success: false }; }
}

export async function sendApprovalEmail(email, name, approved, reason = '') {
  init();
  const msg = approved
    ? `Congratulations ${name}! Your RECYX account has been approved. Login at ${window.location.origin}`
    : `Hello ${name}, your application was not approved. ${reason || 'Contact support.'}`;
  if (!SERVICE_ID) { console.log(`[DEMO] ${approved ? 'Approval' : 'Rejection'} → ${email}`); return { success: true }; }
  try { await emailjs.send(SERVICE_ID, TEMPLATES.approval, { to_email: email, to_name: name, status: approved ? 'APPROVED' : 'REJECTED', message: msg }); return { success: true }; }
  catch (err) { return { success: false }; }
}

export async function sendTransactionEmail(email, name, txData) {
  init();
  if (!SERVICE_ID) { console.log(`[DEMO] Transaction email → ${email}:`, txData); return { success: true }; }
  try { await emailjs.send(SERVICE_ID, TEMPLATES.transaction, { to_email: email, to_name: name, listing_title: txData.listingTitle, action_type: txData.type, from_name: txData.fromName, amount: txData.amount?.toLocaleString() + ' RWF', message: txData.message }); return { success: true }; }
  catch (err) { return { success: false }; }
}

export async function notifyAdminNewListing(listing, userName) {
  init();
  const msg = `New listing: "${listing.title}" (${listing.material}, ${listing.qty}kg) by ${userName} - needs review.`;
  if (!SERVICE_ID) { console.log('[DEMO] Admin listing notify:', msg); return { success: true }; }
  try { await emailjs.send(SERVICE_ID, TEMPLATES.adminNotify, { to_email: ADMIN_EMAIL, to_name: 'RECYX Admin', message: msg, action_url: window.location.origin }); return { success: true }; }
  catch (err) { return { success: false }; }
}
