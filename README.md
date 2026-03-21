# RECYX — Repair. Recycle. Reconnect.

**Rwanda's full-stack platform for device repair, waste trading, and recycling coordination.**

Team 7 | BSc Software Engineering Foundations Project | African Leadership University | March 2026

---

## Quick Start

### Frontend (React)
```bash
cd frontend
npm install
npm start        # → http://localhost:3000
npm test         # 44 integration tests
```

### Backend (FastAPI + PostgreSQL)
```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL in .env (see backend/.env.example)
uvicorn app.main:app --reload   # → http://localhost:8000
pytest -v                        # 59 backend tests
```

---

## Project Structure (63 files)

```
RECYX/
├── backend/                          ← FastAPI + SQLAlchemy + PostGIS
│   ├── app/
│   │   ├── main.py                   # FastAPI entry, CORS, routers
│   │   ├── config.py                 # Pydantic settings from .env
│   │   ├── database.py               # SQLAlchemy engine + session
│   │   ├── models/models.py          # 8 ORM models + enums
│   │   ├── schemas/schemas.py        # Pydantic request/response
│   │   ├── routers/                  # auth, technicians, listings, transactions, reviews, admin
│   │   ├── services/                 # auth, technician, listing, transaction, admin services
│   │   └── middleware/auth.py        # JWT + RBAC (bcrypt, tokens)
│   ├── tests/                        # 59 pytest tests
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                         ← React + Leaflet + EmailJS
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js                    # Main app (Home, Auth, Marketplace, Technicians, Dashboard, Admin, CreateListing)
│   │   ├── components/
│   │   │   ├── Badge.jsx             # Material/status badges
│   │   │   ├── Stars.jsx             # Rating stars
│   │   │   ├── ImageUploader.jsx     # Working drag-and-drop photo upload
│   │   │   └── PaymentFlow.jsx       # MTN MoMo / Airtel Money payment
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── LangContext.js
│   │   ├── data/
│   │   │   ├── sectors.js            # All 30 Rwanda districts with sectors
│   │   │   └── demoData.js           # 22 listings, 16 technicians, offers, notifications
│   │   ├── pages/
│   │   │   ├── AboutPage.jsx         # Team 7 + mission + impact stats
│   │   │   ├── ContactPage.jsx       # Contact form + details
│   │   │   ├── CareersPage.jsx       # 6 job openings
│   │   │   ├── PrivacyPage.jsx       # 7-section privacy policy
│   │   │   ├── TermsPage.jsx         # 14-section terms of service
│   │   │   └── MapPage.jsx           # Leaflet map with 15 facilities
│   │   └── utils/
│   │       ├── emailService.js       # EmailJS (verification, admin notify, approval, transaction)
│   │       └── passwordUtils.js      # Strong password validation + strength meter
│   ├── tests/integration.test.js     # 44 frontend tests
│   └── package.json
│
├── DEMO-CREDENTIALS.md               # Private login credentials (NOT on UI)
├── TESTING.md                        # Step-by-step test commands
├── .gitignore
└── README.md
```

---

## All Features

### Frontend
- Hero slideshow with auto-rotation
- 22 marketplace listings with real product images (Unsplash)
- Counter-offer negotiation: accept / counter / decline
- 16 verified technicians across multiple sectors/districts
- Working drag-and-drop image upload with preview
- Payment flow: MTN Mobile Money + Airtel Money
- 3-step email-verified registration with strong password meter
- Admin panel: account approvals, listing reviews, transaction tracking
- Clickable notifications that navigate to relevant pages
- Real Leaflet.js map with OpenStreetMap (15 facilities)
- Bilingual EN/Kinyarwanda (including 3 Kinyarwanda testimonials)
- Content pages: About, Contact, Careers, Privacy Policy, Terms of Service
- SVG social media icons (Twitter, Instagram, LinkedIn, Facebook)
- Sectors (not just districts) — all 30 districts with real sectors
- Glassmorphism UI, responsive design, smooth animations
- Demo credentials hidden from UI (see DEMO-CREDENTIALS.md)
- Default verification code hidden from UI

### Backend
- FastAPI with 6 API routers: auth, technicians, listings, transactions, reviews, admin
- SQLAlchemy ORM with 8 models (User, TechnicianProfile, RecyclerProfile, WasteListing, Transaction, ServiceRequest, Review, Notification)
- PostgreSQL + PostGIS for spatial queries
- JWT authentication with bcrypt password hashing
- Role-based access control (citizen, technician, recycler, buyer, admin)
- Admin verification workflow (approve/reject accounts and listings)
- Pydantic schemas for request/response validation
- 59 backend tests (pytest)

### Testing
- Backend: 59 tests (auth, models, schemas, transaction state machine)
- Frontend: 44 tests (passwords, sectors, users, listings, technicians, offers, counter-offers, notifications, testimonials, map, verification, full flow)
- Total: 103 tests

---

## Team 7 Members
- Keira Mutoni — Project Lead & Frontend
- Nawaf Ahmed — Backend Development
- Sylivie Tumukunde — Database & Data Management
- Methode Duhujubumwe — System Architecture & DevOps
- Nicole Rhoda Umutesi — Testing & Quality Assurance
- Cindy Saro Teta — Project Management & Outreach

## Admin Email
m.duhujubum@alustudent.com
