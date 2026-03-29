/**
 * RECYX Frontend Integration Tests
 * ─────────────────────────────────────────────────────────────────────────────
 * Testing the localStorage mock service (mockService.js) which acts as the
 * full backend for the frontend demo.
 *
 * Covers:
 *   1. Authentication          (6 tests)
 *   2. Listings                (6 tests)
 *   3. Offers & Transactions   (5 tests)
 *   4. Admin - User Management (6 tests)
 *   5. Admin - Listings        (4 tests)
 *   6. Reviews & Feedback      (6 tests)
 *   7. Testimonials            (5 tests)
 *
 * Total: 38 tests
 *
 * Run:  npm test -- --watchAll=false --verbose
 */

import {
  getUser, registerUser,
  getListings, createListing, getListingById, updateListingViews,
  makeOffer, getAllOffers, acceptOffer,
  getAdminStats, getAllUsers, approveUser, rejectUser, suspendUser, deleteUser,
  approveListing, rejectListing, flagListing,
  getReviews, submitReview, approveReview, deleteReview,
  getFeedback, submitFeedback, markFeedbackRead,
  getPublishedTestimonials, addTestimonial, deleteTestimonial,
  resetAll,
} from '../utils/mockService';

// ── Reset all demo data before every test for full isolation ──────────────────
beforeEach(() => {
  resetAll();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. AUTHENTICATION  (6 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Authentication', () => {

  test('valid credentials return the correct user object', () => {
    const user = getUser('marie@email.com', 'Marie@123');
    expect(user).not.toBeNull();
    expect(user.name).toBe('Marie Uwase');
    expect(user.role).toBe('citizen');
  });

  test('incorrect password returns null', () => {
    const user = getUser('marie@email.com', 'WrongPassword99');
    expect(user).toBeNull();
  });

  test('unknown email address returns null', () => {
    const user = getUser('nobody@unknown.com', 'anypassword');
    expect(user).toBeNull();
  });

  test('citizen registration succeeds and account is auto-verified', () => {
    const result = registerUser({
      name: 'Alice Ingabire',
      email: 'alice.test@recyx.rw',
      password: 'Alice@12345',
      role: 'citizen',
      sector: 'Kacyiru, Gasabo',
      phone: '+250 788 000 001',
    });
    expect(result.success).toBe(true);
    expect(result.user.email).toBe('alice.test@recyx.rw');
    expect(result.user.role).toBe('citizen');
    expect(result.user.verified).toBe(true);
  });

  test('duplicate email registration is rejected with an error message', () => {
    const result = registerUser({
      name: 'Clone Marie',
      email: 'marie@email.com', // already seeded in demo data
      password: 'Clone@1234',
      role: 'citizen',
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('technician registration requires admin approval (verified defaults to false)', () => {
    const result = registerUser({
      name: 'New Technician',
      email: 'newtech@recyx.rw',
      password: 'Tech@12345',
      role: 'technician',
      sector: 'Remera, Gasabo',
      specialization: 'Smartphones & Tablets',
    });
    expect(result.success).toBe(true);
    expect(result.user.verified).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 2. LISTINGS  (6 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Listings', () => {

  test('getListings returns all 22 seeded demo listings', () => {
    const listings = getListings();
    expect(listings.length).toBeGreaterThanOrEqual(22);
  });

  test('getListingById returns the correct listing for a valid ID', () => {
    const listing = getListingById(1);
    expect(listing).toBeDefined();
    expect(listing.title).toBe('Office Desktop Computers (5 units)');
    expect(listing.material).toBe('electronics');
  });

  test('getListingById returns undefined for a non-existent ID', () => {
    expect(getListingById(9999)).toBeUndefined();
  });

  test('createListing adds a new listing with status pending_review', () => {
    const countBefore = getListings().length;
    createListing({
      sellerId: 2,
      sellerName: 'Marie Uwase',
      material: 'plastic',
      qty: 40,
      condition: 'scrap',
      title: 'Test Plastic Scraps - 40kg',
      description: 'Sorted PET bottles from local collection.',
      sector: 'Kimironko, Gasabo',
      price: 8000,
    });
    const listings = getListings();
    expect(listings.length).toBe(countBefore + 1);
    expect(listings[listings.length - 1].status).toBe('pending_review');
  });

  test('updateListingViews increments the view count by exactly 1', () => {
    const viewsBefore = getListingById(1).views;
    updateListingViews(1);
    expect(getListingById(1).views).toBe(viewsBefore + 1);
  });

  test('every listing has the required fields: title, price, sector, status', () => {
    getListings().forEach(listing => {
      expect(listing).toHaveProperty('title');
      expect(listing).toHaveProperty('price');
      expect(listing).toHaveProperty('sector');
      expect(listing).toHaveProperty('status');
    });
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 3. OFFERS & TRANSACTIONS  (5 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Offers & Transactions', () => {

  // Listing 10 (HP Printers) has no seeded offers - safe for all offer tests
  test('makeOffer creates a new pending offer on a listing', () => {
    const result = makeOffer({
      listingId: 10, buyerId: 5,
      buyerName: 'Joseph Mugabo', amount: 300000,
      message: 'Interested in all 8 units.',
    });
    expect(result.success).toBe(true);
    expect(result.offer.status).toBe('pending');
    expect(result.offer.amount).toBe(300000);
  });

  test('a second offer from the same buyer on the same listing is rejected', () => {
    makeOffer({ listingId: 10, buyerId: 5, buyerName: 'Joseph Mugabo', amount: 300000 });
    const duplicate = makeOffer({ listingId: 10, buyerId: 5, buyerName: 'Joseph Mugabo', amount: 310000 });
    expect(duplicate.success).toBe(false);
  });

  test('acceptOffer sets status to accepted and txStatus to awaiting_payment', () => {
    const { offer } = makeOffer({ listingId: 10, buyerId: 5, buyerName: 'Joseph Mugabo', amount: 300000 });
    acceptOffer(offer.id);
    const updated = getAllOffers().find(o => o.id === offer.id);
    expect(updated.status).toBe('accepted');
    expect(updated.txStatus).toBe('awaiting_payment');
  });

  test('accepting one offer automatically declines all other pending offers on the same listing', () => {
    const { offer: o1 } = makeOffer({ listingId: 10, buyerId: 5, buyerName: 'Joseph Mugabo', amount: 300000 });
    const { offer: o2 } = makeOffer({ listingId: 10, buyerId: 8, buyerName: 'Ecoplastic Ltd', amount: 280000 });
    acceptOffer(o1.id);
    const rival = getAllOffers().find(o => o.id === o2.id);
    expect(rival.status).toBe('declined');
  });

  test('getAllOffers returns all offers including the 9 seeded demo offers', () => {
    expect(getAllOffers().length).toBeGreaterThanOrEqual(9);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 4. ADMIN - USER MANAGEMENT  (6 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Admin - User Management', () => {

  test('approveUser sets verified to true for a pending account', () => {
    approveUser(100); // Bernard Twagiramungu - seeded pending technician
    const user = getAllUsers().find(u => u.id === 100);
    expect(user.verified).toBe(true);
  });

  test('rejectUser permanently removes the user from the system', () => {
    rejectUser(100);
    expect(getAllUsers().find(u => u.id === 100)).toBeUndefined();
  });

  test('suspendUser sets suspended to true on an active account', () => {
    suspendUser(2); // Marie Uwase - active citizen
    expect(getAllUsers().find(u => u.id === 2).suspended).toBe(true);
  });

  test('calling suspendUser again on a suspended account restores it (toggle)', () => {
    suspendUser(2);
    suspendUser(2); // second call unsuspends
    expect(getAllUsers().find(u => u.id === 2).suspended).toBe(false);
  });

  test('deleteUser removes the user and all their listings', () => {
    deleteUser(2); // Marie Uwase has multiple seeded listings
    expect(getAllUsers().find(u => u.id === 2)).toBeUndefined();
    expect(getListings().find(l => l.sellerId === 2)).toBeUndefined();
  });

  test('getAdminStats pendingUsers reflects the 3 seeded pending accounts', () => {
    expect(getAdminStats().pendingUsers).toBeGreaterThanOrEqual(3);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 5. ADMIN - LISTING MANAGEMENT  (4 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Admin - Listing Management', () => {

  // Listing 5 (Restaurant Glass Bottles) is the only pending_review demo listing
  test('approveListing changes status from pending_review to available', () => {
    approveListing(5);
    expect(getListingById(5).status).toBe('available');
  });

  test('rejectListing removes the listing from the platform entirely', () => {
    rejectListing(5);
    expect(getListingById(5)).toBeUndefined();
  });

  test('pendingListings count in admin stats decreases by 1 after approval', () => {
    const before = getAdminStats().pendingListings;
    approveListing(5);
    expect(getAdminStats().pendingListings).toBe(before - 1);
  });

  test('flagListing toggles the flagged property (flag then unflag)', () => {
    flagListing(1);
    expect(getListingById(1).flagged).toBe(true);
    flagListing(1); // second call removes the flag
    expect(getListingById(1).flagged).toBe(false);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 6. REVIEWS & FEEDBACK  (6 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Reviews & Feedback', () => {

  test('submitReview creates a new review with pending status', () => {
    const result = submitReview({
      userId: 5, userName: 'Joseph Mugabo',
      listingId: 10, listingTitle: 'HP LaserJet Printers',
      rating: 5, message: 'Great deal, fast and professional!',
    });
    expect(result.success).toBe(true);
    const review = getReviews().find(r => r.userId === 5 && r.listingId === 10);
    expect(review.status).toBe('pending');
    expect(review.rating).toBe(5);
  });

  test('a second review from the same user on the same listing is rejected', () => {
    submitReview({ userId: 5, userName: 'Joseph', listingId: 10, listingTitle: 'HP', rating: 5, message: 'Good' });
    const duplicate = submitReview({ userId: 5, userName: 'Joseph', listingId: 10, listingTitle: 'HP', rating: 3, message: 'Changed mind' });
    expect(duplicate.success).toBe(false);
  });

  test('approveReview sets status to approved and publishes it as a testimonial', () => {
    submitReview({ userId: 5, userName: 'Joseph Mugabo', listingId: 10, listingTitle: 'HP Printers', rating: 5, message: 'Excellent!' });
    const review = getReviews().find(r => r.userId === 5 && r.listingId === 10);
    const testimonialsBefore = getPublishedTestimonials().length;
    approveReview(review.id);
    expect(getReviews().find(r => r.id === review.id).status).toBe('approved');
    expect(getPublishedTestimonials().length).toBe(testimonialsBefore + 1);
  });

  test('deleteReview permanently removes the review', () => {
    submitReview({ userId: 5, userName: 'Joseph', listingId: 10, listingTitle: 'HP', rating: 4, message: 'Solid.' });
    const review = getReviews().find(r => r.userId === 5 && r.listingId === 10);
    deleteReview(review.id);
    expect(getReviews().find(r => r.id === review.id)).toBeUndefined();
  });

  test('submitFeedback stores the message with read set to false', () => {
    submitFeedback({ userId: 2, userName: 'Marie Uwase', message: 'Love this platform!', category: 'general' });
    const entry = getFeedback().find(f => f.userId === 2);
    expect(entry).toBeDefined();
    expect(entry.read).toBe(false);
    expect(entry.category).toBe('general');
  });

  test('markFeedbackRead updates the read property to true', () => {
    submitFeedback({ userId: 2, userName: 'Marie Uwase', message: 'Feature request', category: 'suggestion' });
    const entry = getFeedback().find(f => f.userId === 2);
    markFeedbackRead(entry.id);
    expect(getFeedback().find(f => f.id === entry.id).read).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// 7. TESTIMONIALS  (5 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Testimonials', () => {

  test('6 demo testimonials are pre-loaded on initialization', () => {
    expect(getPublishedTestimonials().length).toBeGreaterThanOrEqual(6);
  });

  test('addTestimonial increases the published testimonials count by 1', () => {
    const before = getPublishedTestimonials().length;
    addTestimonial({ name: 'Amina Uwera', role: 'Citizen, Kicukiro', text: 'RECYX made recycling easy for me!', rating: 5 });
    expect(getPublishedTestimonials().length).toBe(before + 1);
  });

  test('deleteTestimonial removes the entry from the published list', () => {
    addTestimonial({ name: 'Temp Entry', role: 'Buyer, Gasabo', text: 'Temporary testimonial.', rating: 3 });
    const entry = getPublishedTestimonials().find(t => t.name === 'Temp Entry');
    deleteTestimonial(entry.id);
    expect(getPublishedTestimonials().find(t => t.id === entry.id)).toBeUndefined();
  });

  test('all testimonials have the required fields: name, role, text, rating', () => {
    getPublishedTestimonials().forEach(t => {
      expect(t).toHaveProperty('name');
      expect(t).toHaveProperty('role');
      expect(t).toHaveProperty('text');
      expect(t).toHaveProperty('rating');
    });
  });

  test('all testimonial ratings are valid values between 1 and 5', () => {
    getPublishedTestimonials().forEach(t => {
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
    });
  });

});
