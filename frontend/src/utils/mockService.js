// ═══════════════════════════════════════════
// RECYX Mock Service - localStorage-based backend
// ═══════════════════════════════════════════
import {
  USERS,
  LISTINGS,
  OFFERS,
  NOTIFICATIONS,
  TESTIMONIALS,
  MAP_FACILITIES,
  DEFAULT_VERIFICATION_CODE,
} from '../data/demoData';

// ── SERVICE_REQUESTS demo data ──
const DEMO_SERVICE_REQUESTS = [
  { id: 1, techId: 3, userId: 2, userName: "Marie Uwase", device: "Smartphone", problem: "Screen cracked and touch not working", date: "2026-03-15", time: "10:00", status: "pending", contact: "+250 788 111 111" },
  { id: 2, techId: 7, userId: 5, userName: "Joseph Mugabo", device: "Home Appliance", problem: "Washing machine not draining", date: "2026-03-16", time: "14:00", status: "accepted", contact: "+250 788 444 444" },
  { id: 3, techId: 6, userId: 2, userName: "Marie Uwase", device: "Laptop", problem: "Won't boot, BIOS error", date: "2026-03-14", time: "09:00", status: "completed", contact: "+250 788 111 111" },
];

// ── Demo version - bump this string to force-reset all localStorage demo data ──
const DEMO_VERSION = '2.4';

// ── Init helpers ──
function init(key, defaultData) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(defaultData));
  }
}

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initAll() {
  const storedVersion = localStorage.getItem('recyx_demo_version');
  if (storedVersion !== DEMO_VERSION) {
    // Force-reset all demo data when version changes (or on first load)
    set('recyx_users', USERS);
    set('recyx_listings', LISTINGS);
    set('recyx_offers', OFFERS);
    set('recyx_notifications', NOTIFICATIONS);
    set('recyx_service_requests', DEMO_SERVICE_REQUESTS);
    set('recyx_testimonials', TESTIMONIALS.map((t, i) => ({ ...t, id: i + 1, source: 'admin' })));
    set('recyx_reviews', TESTIMONIALS.map((t, i) => ({
      id: 100 + i,
      userId: null,
      userName: t.name,
      listingId: null,
      listingTitle: t.role,
      rating: t.rating,
      message: t.text,
      date: '2026-03-01',
      status: 'approved',
    })));
    set('recyx_feedback', []);
    localStorage.setItem('recyx_demo_version', DEMO_VERSION);
  } else {
    init('recyx_users', USERS);
    init('recyx_listings', LISTINGS);
    init('recyx_offers', OFFERS);
    init('recyx_notifications', NOTIFICATIONS);
    init('recyx_service_requests', DEMO_SERVICE_REQUESTS);
    init('recyx_testimonials', TESTIMONIALS.map((t, i) => ({ ...t, id: i + 1, source: 'admin' })));
    init('recyx_reviews', TESTIMONIALS.map((t, i) => ({
      id: 100 + i,
      userId: null,
      userName: t.name,
      listingId: null,
      listingTitle: t.role,
      rating: t.rating,
      message: t.text,
      date: '2026-03-01',
      status: 'approved',
    })));
    init('recyx_feedback', []);
  }
}

// Call on module load
initAll();

// ── PROFILE UPDATE ──
export function updateUser(userId, changes) {
  const users = get('recyx_users');
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return { success: false };
  // Never allow email or role to be changed
  const { email, role, ...safe } = changes;
  users[idx] = { ...users[idx], ...safe };
  set('recyx_users', users);
  return { success: true, user: users[idx] };
}

// ── AUTH ──
export function getUser(email, pw) {
  const users = get('recyx_users');
  const u = users.find(u => u.email === email && u.pw === pw);
  if (!u) return null;
  if (!u.verified && u.role !== 'admin') {
    // pending accounts can still log in but will see pending screen
  }
  return u;
}

export function registerUser(data) {
  const users = get('recyx_users');
  if (users.find(u => u.email === data.email)) {
    return { success: false, error: 'Email already registered.' };
  }
  const newUser = {
    id: Date.now(),
    name: data.name,
    email: data.email,
    pw: data.password,
    role: data.role,
    sector: data.sector || '',
    verified: ['citizen', 'buyer'].includes(data.role),
    avatar: data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    phone: data.phone || '',
    spec: data.specialization || '',
    company: data.company || '',
    date: new Date().toISOString().split('T')[0],
  };
  users.push(newUser);
  set('recyx_users', users);

  // Notify admin if technician/recycler
  if (['technician', 'recycler'].includes(data.role)) {
    const notifs = get('recyx_notifications');
    notifs.push({
      id: Date.now(),
      userId: 1,
      message: `New ${data.role}: ${data.name} - requires your approval`,
      read: false,
      date: new Date().toISOString().split('T')[0],
      type: 'admin',
    });
    set('recyx_notifications', notifs);
  }

  return { success: true, user: newUser };
}

// ── LISTINGS ──
export function getListings() {
  return get('recyx_listings');
}

export function getListingById(id) {
  return get('recyx_listings').find(l => l.id === Number(id));
}

export function createListing(data) {
  const listings = get('recyx_listings');
  const newListing = {
    id: Date.now(),
    sellerId: data.sellerId,
    sellerName: data.sellerName || 'Unknown',
    material: data.material,
    qty: data.qty,
    condition: data.condition,
    title: data.title,
    description: data.description,
    sector: data.sector,
    status: 'pending_review',
    price: Number(data.price),
    date: new Date().toISOString().split('T')[0],
    views: 0,
    favorites: 0,
    image: data.image || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&h=350&fit=crop',
    images: data.images || [],
    paymentMethod: data.paymentMethod || 'mtn',
    paymentNumber: data.paymentNumber || '',
  };
  listings.push(newListing);
  set('recyx_listings', listings);

  // Notify admin
  const notifs = get('recyx_notifications');
  notifs.push({
    id: Date.now() + 1,
    userId: 1,
    message: `New listing pending review: ${data.title}`,
    read: false,
    date: new Date().toISOString().split('T')[0],
    type: 'admin',
  });
  set('recyx_notifications', notifs);

  return newListing;
}

export function updateListingViews(id) {
  const listings = get('recyx_listings');
  const idx = listings.findIndex(l => l.id === Number(id));
  if (idx !== -1) {
    listings[idx].views = (listings[idx].views || 0) + 1;
    set('recyx_listings', listings);
  }
}

// ── OFFERS ──
export function getOffers(listingId) {
  return get('recyx_offers').filter(o => o.listingId === Number(listingId));
}

export function getAllOffers() {
  return get('recyx_offers');
}

export function makeOffer(data) {
  const offers = get('recyx_offers');
  // Check if buyer already has offer on this listing
  const existing = offers.find(o => o.listingId === data.listingId && o.buyerId === data.buyerId && o.status === 'pending');
  if (existing) {
    return { success: false, error: 'You already have a pending offer on this listing.' };
  }
  const newOffer = {
    id: Date.now(),
    listingId: Number(data.listingId),
    buyerId: data.buyerId,
    buyerName: data.buyerName,
    amount: Number(data.amount),
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
    message: data.message || '',
  };
  offers.push(newOffer);
  set('recyx_offers', offers);

  // Notify seller
  const listings = get('recyx_listings');
  const listing = listings.find(l => l.id === Number(data.listingId));
  if (listing) {
    const notifs = get('recyx_notifications');
    notifs.push({
      id: Date.now() + 1,
      userId: listing.sellerId,
      message: `New offer: ${Number(data.amount).toLocaleString()} RWF on "${listing.title}" from ${data.buyerName}`,
      read: false,
      date: new Date().toISOString().split('T')[0],
      type: 'offer',
      listingId: listing.id,
    });
    set('recyx_notifications', notifs);
  }

  return { success: true, offer: newOffer };
}

export function acceptOffer(offerId) {
  const offers = get('recyx_offers');
  const idx = offers.findIndex(o => o.id === Number(offerId));
  if (idx === -1) return { success: false, error: 'Offer not found.' };

  // Decline all other offers for same listing
  const listingId = offers[idx].listingId;
  offers.forEach((o, i) => {
    if (o.listingId === listingId && o.id !== Number(offerId) && o.status === 'pending') {
      offers[i].status = 'declined';
    }
  });

  offers[idx].status = 'accepted';
  offers[idx].txStatus = 'awaiting_payment';
  set('recyx_offers', offers);

  // Update listing
  const listings = get('recyx_listings');
  const lIdx = listings.findIndex(l => l.id === listingId);
  if (lIdx !== -1) {
    listings[lIdx].status = 'pending';
    set('recyx_listings', listings);
  }

  // Notify buyer
  const notifs = get('recyx_notifications');
  notifs.push({
    id: Date.now(),
    userId: offers[idx].buyerId,
    message: `Your offer of ${offers[idx].amount.toLocaleString()} RWF was accepted! Set up payment.`,
    read: false,
    date: new Date().toISOString().split('T')[0],
    type: 'payment',
    listingId: listingId,
  });
  set('recyx_notifications', notifs);

  return { success: true };
}

export function counterOffer(offerId, amount, message) {
  const offers = get('recyx_offers');
  const idx = offers.findIndex(o => o.id === Number(offerId));
  if (idx === -1) return { success: false };
  offers[idx].status = 'countered';
  offers[idx].counterAmount = Number(amount);
  offers[idx].counterMessage = message || '';
  set('recyx_offers', offers);

  // Notify buyer
  const listings = get('recyx_listings');
  const listing = listings.find(l => l.id === offers[idx].listingId);
  const notifs = get('recyx_notifications');
  notifs.push({
    id: Date.now(),
    userId: offers[idx].buyerId,
    message: `Counter-offer received: ${Number(amount).toLocaleString()} RWF on "${listing ? listing.title : 'your offer'}"`,
    read: false,
    date: new Date().toISOString().split('T')[0],
    type: 'counter',
    listingId: offers[idx].listingId,
  });
  set('recyx_notifications', notifs);

  return { success: true };
}

export function declineOffer(offerId) {
  const offers = get('recyx_offers');
  const idx = offers.findIndex(o => o.id === Number(offerId));
  if (idx === -1) return { success: false };
  offers[idx].status = 'declined';
  set('recyx_offers', offers);
  return { success: true };
}

export function acceptCounter(offerId) {
  const offers = get('recyx_offers');
  const idx = offers.findIndex(o => o.id === Number(offerId));
  if (idx === -1) return { success: false };
  offers[idx].status = 'accepted';
  offers[idx].amount = offers[idx].counterAmount;
  offers[idx].txStatus = 'awaiting_payment';
  set('recyx_offers', offers);
  return { success: true };
}

export function markOfferPaid(offerId) {
  const offers = get('recyx_offers');
  const idx = offers.findIndex(o => o.id === Number(offerId));
  if (idx === -1) return { success: false };
  offers[idx].txStatus = 'awaiting_confirmation';
  offers[idx].paid = true;
  set('recyx_offers', offers);
  return { success: true };
}

export function confirmReceiptOffer(offerId) {
  const offers = get('recyx_offers');
  const idx = offers.findIndex(o => o.id === Number(offerId));
  if (idx === -1) return { success: false };
  offers[idx].txStatus = 'completed';
  set('recyx_offers', offers);

  // Mark listing completed
  const listings = get('recyx_listings');
  const lIdx = listings.findIndex(l => l.id === offers[idx].listingId);
  if (lIdx !== -1) {
    listings[lIdx].status = 'completed';
    set('recyx_listings', listings);
  }
  return { success: true };
}

// ── NOTIFICATIONS ──
export function getNotifications(userId) {
  return get('recyx_notifications').filter(n => n.userId === Number(userId)).sort((a, b) => b.id - a.id);
}

export function markRead(notifId) {
  const notifs = get('recyx_notifications');
  const idx = notifs.findIndex(n => n.id === Number(notifId));
  if (idx !== -1) {
    notifs[idx].read = true;
    set('recyx_notifications', notifs);
  }
}

export function markAllRead(userId) {
  const notifs = get('recyx_notifications');
  notifs.forEach((n, i) => {
    if (n.userId === Number(userId)) notifs[i].read = true;
  });
  set('recyx_notifications', notifs);
}

// ── SERVICE REQUESTS ──
export function getServiceRequests(userId, role) {
  const reqs = get('recyx_service_requests');
  if (role === 'technician') return reqs.filter(r => r.techId === Number(userId));
  return reqs.filter(r => r.userId === Number(userId));
}

export function getAllServiceRequests() {
  return get('recyx_service_requests');
}

export function createServiceRequest(data) {
  const reqs = get('recyx_service_requests');
  const newReq = {
    id: Date.now(),
    techId: Number(data.techId),
    techName: data.techName || '',
    userId: Number(data.userId),
    userName: data.userName || '',
    device: data.device,
    problem: data.problem,
    date: data.date,
    time: data.time || '',
    contact: data.contact || '',
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
  };
  reqs.push(newReq);
  set('recyx_service_requests', reqs);

  // Notify technician
  const notifs = get('recyx_notifications');
  notifs.push({
    id: Date.now() + 1,
    userId: Number(data.techId),
    message: `New service request from ${data.userName}: ${data.device} - ${data.problem.slice(0, 50)}`,
    read: false,
    date: new Date().toISOString().split('T')[0],
    type: 'service',
  });
  set('recyx_notifications', notifs);

  return { success: true, request: newReq };
}

export function updateServiceRequest(reqId, status) {
  const reqs = get('recyx_service_requests');
  const idx = reqs.findIndex(r => r.id === Number(reqId));
  if (idx !== -1) {
    reqs[idx].status = status;
    set('recyx_service_requests', reqs);
  }
  return { success: true };
}

// ── ADMIN ──
// ── REVIEWS & FEEDBACK ──
export function submitReview(data) {
  const reviews = get('recyx_reviews');
  if (reviews.find(r => r.listingId === data.listingId && r.userId === data.userId)) {
    return { success: false, error: 'You have already reviewed this listing.' };
  }
  const review = {
    id: Date.now(),
    userId: data.userId,
    userName: data.userName,
    listingId: data.listingId,
    listingTitle: data.listingTitle,
    rating: data.rating,
    message: data.message,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
  };
  reviews.push(review);
  set('recyx_reviews', reviews);
  const notifs = get('recyx_notifications');
  notifs.push({ id: Date.now() + 1, userId: 1, message: `New review from ${data.userName} on "${data.listingTitle}" - awaiting approval`, read: false, date: new Date().toISOString().split('T')[0], type: 'admin' });
  set('recyx_notifications', notifs);
  return { success: true };
}

export function submitFeedback(data) {
  const feedback = get('recyx_feedback');
  feedback.push({ id: Date.now(), userId: data.userId, userName: data.userName, message: data.message, category: data.category || 'general', date: new Date().toISOString().split('T')[0], read: false });
  set('recyx_feedback', feedback);
  const notifs = get('recyx_notifications');
  notifs.push({ id: Date.now() + 1, userId: 1, message: `New feedback from ${data.userName}: "${data.message.slice(0, 60)}"`, read: false, date: new Date().toISOString().split('T')[0], type: 'admin' });
  set('recyx_notifications', notifs);
  return { success: true };
}

export function getReviews() { return get('recyx_reviews'); }
export function getFeedback() { return get('recyx_feedback'); }

export function approveReview(reviewId) {
  const reviews = get('recyx_reviews');
  const idx = reviews.findIndex(r => r.id === Number(reviewId));
  if (idx === -1) return { success: false };
  reviews[idx].status = 'approved';
  set('recyx_reviews', reviews);
  const r = reviews[idx];
  const testimonials = get('recyx_testimonials');
  testimonials.push({ id: Date.now(), name: r.userName, role: `RECYX User`, text: r.message, rating: r.rating, source: 'review', reviewId: Number(reviewId) });
  set('recyx_testimonials', testimonials);
  return { success: true };
}

export function deleteReview(reviewId) {
  const reviews = get('recyx_reviews').filter(r => r.id !== Number(reviewId));
  set('recyx_reviews', reviews);
  return { success: true };
}

export function markFeedbackRead(feedbackId) {
  const feedback = get('recyx_feedback');
  const idx = feedback.findIndex(f => f.id === Number(feedbackId));
  if (idx !== -1) { feedback[idx].read = true; set('recyx_feedback', feedback); }
  return { success: true };
}

export function deleteFeedback(feedbackId) {
  const feedback = get('recyx_feedback').filter(f => f.id !== Number(feedbackId));
  set('recyx_feedback', feedback);
  return { success: true };
}

// ── TESTIMONIALS ──
export function getPublishedTestimonials() { return get('recyx_testimonials'); }

export function addTestimonial(data) {
  const testimonials = get('recyx_testimonials');
  testimonials.push({ id: Date.now(), name: data.name, role: data.role, text: data.text, rating: data.rating, source: 'admin' });
  set('recyx_testimonials', testimonials);
  return { success: true };
}

export function deleteTestimonial(id) {
  const testimonials = get('recyx_testimonials').filter(t => t.id !== Number(id));
  set('recyx_testimonials', testimonials);
  return { success: true };
}

export function getAdminStats() {
  const users = get('recyx_users');
  const listings = get('recyx_listings');
  const offers = get('recyx_offers');
  const reviews = get('recyx_reviews');
  const feedback = get('recyx_feedback');
  return {
    pendingUsers: users.filter(u => !u.verified && ['technician', 'recycler'].includes(u.role)).length,
    pendingListings: listings.filter(l => l.status === 'pending_review').length,
    totalUsers: users.filter(u => u.role !== 'admin').length,
    activeTransactions: offers.filter(o => o.status === 'accepted' && o.txStatus !== 'completed').length,
    totalListings: listings.filter(l => l.status !== 'pending_review').length,
    completedTx: offers.filter(o => o.txStatus === 'completed').length,
    suspendedUsers: users.filter(u => u.suspended).length,
    flaggedListings: listings.filter(l => l.flagged).length,
    pendingReviews: reviews.filter(r => r.status === 'pending').length,
    unreadFeedback: feedback.filter(f => !f.read).length,
  };
}

export function getPendingUsers() {
  return get('recyx_users').filter(u => !u.verified && ['technician', 'recycler'].includes(u.role));
}

export function getPendingListings() {
  return get('recyx_listings').filter(l => l.status === 'pending_review');
}

export function getActiveTransactions() {
  const offers = get('recyx_offers').filter(o => o.status === 'accepted');
  const listings = get('recyx_listings');
  const users = get('recyx_users');
  return offers.map(o => {
    const listing = listings.find(l => l.id === o.listingId);
    const seller = listing ? users.find(u => u.id === listing.sellerId) : null;
    const buyer = users.find(u => u.id === o.buyerId);
    return {
      ...o,
      listingTitle: listing ? listing.title : 'Unknown',
      sellerName: seller ? seller.name : 'Unknown',
      buyerName: o.buyerName || (buyer ? buyer.name : 'Unknown'),
    };
  });
}

export function approveUser(userId) {
  const users = get('recyx_users');
  const idx = users.findIndex(u => u.id === Number(userId));
  if (idx !== -1) {
    users[idx].verified = true;
    set('recyx_users', users);
    // Notify user
    const notifs = get('recyx_notifications');
    notifs.push({
      id: Date.now(),
      userId: Number(userId),
      message: 'Your account has been approved! You can now access all features.',
      read: false,
      date: new Date().toISOString().split('T')[0],
      type: 'info',
    });
    set('recyx_notifications', notifs);
  }
  return { success: true };
}

export function rejectUser(userId) {
  const users = get('recyx_users');
  const filtered = users.filter(u => u.id !== Number(userId));
  set('recyx_users', filtered);
  return { success: true };
}

export function approveListing(listingId) {
  const listings = get('recyx_listings');
  const idx = listings.findIndex(l => l.id === Number(listingId));
  if (idx !== -1) {
    listings[idx].status = 'available';
    set('recyx_listings', listings);
    // Notify seller
    const notifs = get('recyx_notifications');
    notifs.push({
      id: Date.now(),
      userId: listings[idx].sellerId,
      message: `Your listing "${listings[idx].title}" has been approved and is now live!`,
      read: false,
      date: new Date().toISOString().split('T')[0],
      type: 'info',
      listingId: Number(listingId),
    });
    set('recyx_notifications', notifs);
  }
  return { success: true };
}

export function rejectListing(listingId) {
  const listings = get('recyx_listings');
  const listing = listings.find(l => l.id === Number(listingId));
  const filtered = listings.filter(l => l.id !== Number(listingId));
  set('recyx_listings', filtered);
  if (listing) {
    const notifs = get('recyx_notifications');
    notifs.push({
      id: Date.now(),
      userId: listing.sellerId,
      message: `Your listing "${listing.title}" was not approved. Please review the guidelines.`,
      read: false,
      date: new Date().toISOString().split('T')[0],
      type: 'info',
    });
    set('recyx_notifications', notifs);
  }
  return { success: true };
}

export function scheduleVisit(id, type) {
  // type = 'user' | 'listing'
  const notifs = get('recyx_notifications');
  notifs.push({
    id: Date.now(),
    userId: 1,
    message: `Visit scheduled for ${type} #${id}`,
    read: false,
    date: new Date().toISOString().split('T')[0],
    type: 'info',
  });
  set('recyx_notifications', notifs);
  return { success: true };
}

// ── MAP FACILITIES ──
export function getFacilities() {
  return MAP_FACILITIES;
}

// ── USERS ──
export function getAllUsers() {
  return get('recyx_users');
}

export function getUserById(id) {
  return get('recyx_users').find(u => u.id === Number(id));
}

export function suspendUser(userId) {
  const users = get('recyx_users');
  const idx = users.findIndex(u => u.id === Number(userId));
  if (idx !== -1) {
    users[idx].suspended = !users[idx].suspended;
    set('recyx_users', users);
    return { success: true, suspended: users[idx].suspended };
  }
  return { success: false };
}

export function deleteUser(userId) {
  const users = get('recyx_users').filter(u => u.id !== Number(userId));
  set('recyx_users', users);
  // Remove their listings and offers too
  const listings = get('recyx_listings').filter(l => l.sellerId !== Number(userId));
  set('recyx_listings', listings);
  const offers = get('recyx_offers').filter(o => o.buyerId !== Number(userId));
  set('recyx_offers', offers);
  return { success: true };
}

export function removeListing(listingId) {
  const listings = get('recyx_listings').filter(l => l.id !== Number(listingId));
  set('recyx_listings', listings);
  // Cancel related offers
  const offers = get('recyx_offers').map(o =>
    o.listingId === Number(listingId) ? { ...o, status: 'declined' } : o
  );
  set('recyx_offers', offers);
  return { success: true };
}

export function flagListing(listingId) {
  const listings = get('recyx_listings');
  const idx = listings.findIndex(l => l.id === Number(listingId));
  if (idx !== -1) {
    listings[idx].flagged = !listings[idx].flagged;
    set('recyx_listings', listings);
    return { success: true, flagged: listings[idx].flagged };
  }
  return { success: false };
}

export function cancelTransaction(offerId) {
  const offers = get('recyx_offers');
  const idx = offers.findIndex(o => o.id === Number(offerId));
  if (idx !== -1) {
    offers[idx].status = 'declined';
    offers[idx].txStatus = 'cancelled';
    offers[idx].cancelledByAdmin = true;
    set('recyx_offers', offers);
    // Restore listing to available
    const listings = get('recyx_listings');
    const lIdx = listings.findIndex(l => l.id === offers[idx].listingId);
    if (lIdx !== -1) { listings[lIdx].status = 'available'; set('recyx_listings', listings); }
    return { success: true };
  }
  return { success: false };
}

export function verifyCode(code) {
  return code === DEFAULT_VERIFICATION_CODE;
}

// ── Reset (for dev) ──
export function resetAll() {
  ['recyx_users', 'recyx_listings', 'recyx_offers', 'recyx_notifications', 'recyx_service_requests', 'recyx_testimonials', 'recyx_reviews', 'recyx_feedback', 'recyx_demo_version'].forEach(k => localStorage.removeItem(k));
  initAll();
}
