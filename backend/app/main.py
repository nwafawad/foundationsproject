"""RECYX FastAPI Application — Main entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_tables
from app.routers import auth, technicians, listings, transactions, reviews, admin, facilities, notifications
from app.seed import seed_demo_data
from app.database import SessionLocal

settings = get_settings()

app = FastAPI(
    title="RECYX API",
    description="Rwanda's platform for device repair, waste trading, and recycling",
    version="4.0.0",
)

# CORS - Allow multiple origins for development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "https://recyx.netlify.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(technicians.router, tags=["Technicians"])
app.include_router(listings.router, tags=["Listings"])
app.include_router(transactions.router, tags=["Transactions"])
app.include_router(reviews.router, tags=["Reviews"])
app.include_router(admin.router, tags=["Admin"])
app.include_router(facilities.router, tags=["Facilities"])
app.include_router(notifications.router, tags=["Notifications"])


@app.on_event("startup")
async def startup():
    import logging
    logging.basicConfig(level=logging.INFO)
    logging.getLogger("uvicorn").info(f"[RECYX] Using database: {settings.DATABASE_URL}")
    create_tables()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()


@app.get("/")
async def root():
    return {"message": "RECYX API is running", "version": "4.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
