"""Transaction endpoints with state machine transitions."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.schemas import TransactionCreate, TransactionStatusUpdate, TransactionOut
from app.services import transaction_service
from app.middleware.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionOut, status_code=201)
def create_transaction(
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit an offer on a waste listing."""
    return transaction_service.create_transaction(db, current_user.user_id, data)


@router.patch("/{transaction_id}/status", response_model=TransactionOut)
def update_status(
    transaction_id: int,
    data: TransactionStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update transaction status (validated state machine)."""
    return transaction_service.update_transaction_status(
        db, transaction_id, current_user.user_id, data.status
    )


@router.get("/mine", response_model=List[TransactionOut])
def get_my_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all transactions for the current user."""
    return transaction_service.get_user_transactions(db, current_user.user_id)
