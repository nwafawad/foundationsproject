# RECYX — Testing Documentation

## IMPORTANT: Navigate to the correct folder FIRST

After extracting the RECYX.zip, open Terminal and run:

```bash
cd ~/Downloads/RECYX
```

If you extracted it elsewhere, adjust the path accordingly.

---

## STEP 1: Backend Tests (pytest)

```bash
cd ~/Downloads/RECYX/backend
pip install -r requirements.txt
pip install pytest pytest-mock
pytest -v
```

You should see ~59 tests with PASSED status.

---

## STEP 2: Backend Linting (Ruff)

```bash
cd ~/Downloads/RECYX/backend
pip install ruff
ruff check app/ tests/
```

Should show "All checks passed!" (we fixed all 15 errors).

---

## STEP 3: Backend Formatting (Black)

```bash
cd ~/Downloads/RECYX/backend
pip install black
black --check --line-length 88 app/ tests/
```

---

## STEP 4: Frontend Tests (Jest)

```bash
cd ~/Downloads/RECYX/frontend
npm install
npm test -- --watchAll=false --verbose
```

You should see ~38 tests across 2 test suites with green checkmarks.

---

## STEP 5: Frontend Linting (ESLint)

```bash
cd ~/Downloads/RECYX/frontend
npx eslint src/ --ext .js,.jsx --format stylish
```

---

## ALL-IN-ONE Backend Screenshot

```bash
cd ~/Downloads/RECYX/backend
echo "========== PYTEST UNIT TESTS ==========" && pytest -v && echo "" && echo "========== RUFF LINTING ==========" && ruff check app/ tests/ && echo "" && echo "========== BLACK FORMATTING ==========" && black --check --line-length 88 app/ tests/
```

## ALL-IN-ONE Frontend Screenshot

```bash
cd ~/Downloads/RECYX/frontend
echo "========== JEST UNIT TESTS ==========" && npm test -- --watchAll=false --verbose
```

---

## Frontend Integration Test Results

File: `frontend/src/tests/integration.test.js`
Test runner: Jest (via `react-scripts test`)
Total: **38 tests** across **7 suites**

### 1. Authentication (6 tests)

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| 1 | Valid credentials return correct user | email: `marie@email.com`, password: `Marie@123` | Returns user object with `name="Marie Uwase"`, `role="citizen"` | User object returned with correct fields | PASS |
| 2 | Incorrect password returns null | email: `marie@email.com`, password: `WrongPassword99` | Returns `null` | Returns `null` | PASS |
| 3 | Unknown email returns null | email: `nobody@unknown.com`, password: `anypassword` | Returns `null` | Returns `null` | PASS |
| 4 | Citizen registration succeeds and is auto-verified | role: `citizen`, email: `alice.test@recyx.rw` | `success=true`, `verified=true` | User created with `verified=true` | PASS |
| 5 | Duplicate email is rejected | email: `marie@email.com` (already seeded) | `success=false`, `error` defined | Registration rejected with error message | PASS |
| 6 | Technician registration requires admin approval | role: `technician`, email: `newtech@recyx.rw` | `success=true`, `verified=false` | User created with `verified=false` pending approval | PASS |

### 2. Listings (6 tests)

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| 7 | getListings returns all seeded listings | — | Array length ≥ 22 | Returns 22 demo listings | PASS |
| 8 | getListingById returns correct listing | id: `1` | `title="Office Desktop Computers (5 units)"`, `material="electronics"` | Correct listing returned | PASS |
| 9 | getListingById returns undefined for non-existent ID | id: `9999` | `undefined` | Returns `undefined` | PASS |
| 10 | createListing adds new listing as pending_review | sellerId: 2, material: `plastic` | Count increases by 1; new listing has `status="pending_review"` | Listing added with correct status | PASS |
| 11 | updateListingViews increments view count by 1 | id: `1` | `views` increases by exactly 1 | View count incremented | PASS |
| 12 | Every listing has required fields | All 22 listings | Each has `title`, `price`, `sector`, `status` | All fields present on all listings | PASS |

### 3. Offers & Transactions (5 tests)

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| 13 | makeOffer creates a pending offer | listingId: 10, buyerId: 5, amount: 300000 | `success=true`, `offer.status="pending"`, `offer.amount=300000` | Offer created with correct fields | PASS |
| 14 | Duplicate offer from same buyer is rejected | Same buyerId + listingId twice | Second call returns `success=false` | Duplicate rejected | PASS |
| 15 | acceptOffer sets accepted status and txStatus | Accept offer on listing 10 | `status="accepted"`, `txStatus="awaiting_payment"` | Offer status updated correctly | PASS |
| 16 | Accepting one offer auto-declines all rivals | Two offers on listing 10; accept first | Second offer `status="declined"` | Rival offer automatically declined | PASS |
| 17 | getAllOffers returns all seeded offers | — | Array length ≥ 9 | Returns 9+ demo offers | PASS |

### 4. Admin — User Management (6 tests)

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| 18 | approveUser sets verified to true | userId: `100` (seeded pending technician) | `verified=true` | User verified | PASS |
| 19 | rejectUser removes user from system | userId: `100` | User not found in getAllUsers() | User permanently removed | PASS |
| 20 | suspendUser sets suspended to true | userId: `2` (Marie Uwase, active) | `suspended=true` | User suspended | PASS |
| 21 | Second suspendUser call restores account (toggle) | userId: `2` suspended twice | `suspended=false` after second call | Toggle behavior confirmed | PASS |
| 22 | deleteUser removes user and all their listings | userId: `2` | User gone; no listings with `sellerId=2` remain | User and listings both removed | PASS |
| 23 | getAdminStats pendingUsers reflects seeded accounts | — | `pendingUsers` ≥ 3 | Returns correct count | PASS |

### 5. Admin — Listing Management (4 tests)

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| 24 | approveListing changes status to available | listingId: `5` (pending_review) | `status="available"` | Status updated | PASS |
| 25 | rejectListing removes listing entirely | listingId: `5` | getListingById(5) returns `undefined` | Listing removed | PASS |
| 26 | pendingListings stat decreases after approval | Approve listing 5 | `pendingListings` = before − 1 | Count decremented | PASS |
| 27 | flagListing toggles flagged property | Flag listing 1 twice | `flagged=true` after first call, `flagged=false` after second | Toggle works correctly | PASS |

### 6. Reviews & Feedback (6 tests)

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| 28 | submitReview creates review with pending status | userId: 5, listingId: 10, rating: 5 | `success=true`; review has `status="pending"`, `rating=5` | Review created correctly | PASS |
| 29 | Duplicate review from same user is rejected | Same userId + listingId twice | Second call returns `success=false` | Duplicate rejected | PASS |
| 30 | approveReview publishes as testimonial | Approve review from userId 5 on listing 10 | Review `status="approved"`; testimonials count +1 | Review approved and testimonial added | PASS |
| 31 | deleteReview permanently removes review | Delete review by id | Review not found in getReviews() | Review removed | PASS |
| 32 | submitFeedback stores with read=false | userId: 2, category: `general` | Feedback stored with `read=false`, `category="general"` | Feedback stored correctly | PASS |
| 33 | markFeedbackRead sets read to true | Mark feedback entry | `read=true` | Read status updated | PASS |

### 7. Testimonials (5 tests)

| # | Test Case | Input | Expected Result | Actual Result | Status |
|---|-----------|-------|-----------------|---------------|--------|
| 34 | 6 demo testimonials are pre-loaded | — | `getPublishedTestimonials().length` ≥ 6 | 6 testimonials available on init | PASS |
| 35 | addTestimonial increases count by 1 | name: `Amina Uwera`, rating: 5 | Count = before + 1 | Testimonial added | PASS |
| 36 | deleteTestimonial removes entry | Add then delete a testimonial | Deleted entry not found in list | Entry removed | PASS |
| 37 | All testimonials have required fields | All testimonials | Each has `name`, `role`, `text`, `rating` | All fields present | PASS |
| 38 | All ratings are valid (1–5) | All testimonials | Each `rating` is between 1 and 5 inclusive | All ratings valid | PASS |

---

## Backend Test Results Summary

File: `backend/tests/`
Test runner: pytest
Total: **59 tests** across multiple modules

Key areas covered:

| Module | Tests | Coverage |
|--------|-------|----------|
| Authentication (JWT, login, register) | 12 | Token generation, invalid credentials, role enforcement |
| Listings CRUD | 11 | Create, read, update, delete, status transitions |
| Offers & Transactions | 9 | Make offer, accept, decline, payment status |
| User Management (Admin) | 10 | Approve, reject, suspend, delete users |
| Notifications | 8 | Create, read, mark-read notifications |
| Feedback & Reviews | 9 | Submit, approve, delete feedback and reviews |

All 59 tests pass with no warnings when run with `pytest -v`.
