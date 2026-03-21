"""RECYX FastAPI Application — Main entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import create_tables
from app.routers import auth, technicians, listings, transactions, reviews, admin

settings = get_settings()

app = FastAPI(
    title="RECYX API",
    description="Rwanda's platform for device repair, waste trading, and recycling",
    version="4.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(technicians.router, prefix="/api/technicians", tags=["Technicians"])
app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["Reviews"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.on_event("startup")
async def startup():
    create_tables()


@app.get("/")
async def root():
    return {"message": "RECYX API is running", "version": "4.0.0", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
