"""Transaction management with state machine validation."""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Transaction, WasteListing, TransactionStatus, ListingStatus, User
from app.schemas.schemas import TransactionCreate, TransactionOut

# Valid state transitions
VALID_TRANSITIONS = {
    TransactionStatus.offer_received: [
        TransactionStatus.offer_accepted,
        TransactionStatus.cancelled,
    ],
    TransactionStatus.offer_accepted: [
        TransactionStatus.in_transit,
        TransactionStatus.cancelled,
    ],
    TransactionStatus.in_transit: [
        TransactionStatus.completed,
        TransactionStatus.cancelled,
    ],
    TransactionStatus.completed: [],
    TransactionStatus.cancelled: [],
}


def create_transaction(
    db: Session, buyer_id: int, data: TransactionCreate
) -> TransactionOut:
    """Create a new transaction (offer) on a listing."""
    listing = db.query(WasteListing).filter(
        WasteListing.listing_id == data.listing_id,
        WasteListing.status == ListingStatus.available,
    ).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Available listing not found",
        )
    if listing.posted_by == buyer_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot make offer on your own listing",
        )

    transaction = Transaction(
        listing_id=data.listing_id,
        seller_id=listing.posted_by,
        buyer_id=buyer_id,
        agreed_price=data.offered_price,
    )
    listing.status = ListingStatus.transacting
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return TransactionOut.model_validate(transaction)


def update_transaction_status(
    db: Session, transaction_id: int, user_id: int, new_status: str
) -> TransactionOut:
    """Update transaction status with state machine validation."""
    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if transaction.seller_id != user_id and transaction.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Not a party to this transaction")

    target = TransactionStatus(new_status)
    if target not in VALID_TRANSITIONS.get(transaction.status, []):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot transition from {transaction.status.value} to {new_status}",
        )

    transaction.status = target
    if target == TransactionStatus.completed:
        transaction.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(transaction)
    return TransactionOut.model_validate(transaction)


def get_user_transactions(db: Session, user_id: int) -> list[TransactionOut]:
    """Get all transactions for a user."""
    results = (
        db.query(Transaction, User)
        .join(User, Transaction.buyer_id == User.user_id)
        .filter(
            (Transaction.seller_id == user_id) | (Transaction.buyer_id == user_id)
        )
        .order_by(Transaction.created_at.desc())
        .all()
    )
    return [_to_out(txn, buyer) for txn, buyer in results]


def get_listing_transactions(
    db: Session, listing_id: Optional[int], user_id: int
) -> list[TransactionOut]:
    """Get transactions for a listing (or all of user's transactions)."""
    query = db.query(Transaction, User).join(User, Transaction.buyer_id == User.user_id)
    if listing_id:
        query = query.filter(Transaction.listing_id == listing_id)
    else:
        query = query.filter(
            (Transaction.seller_id == user_id) | (Transaction.buyer_id == user_id)
        )
    results = query.order_by(Transaction.created_at.desc()).all()
    return [_to_out(txn, buyer) for txn, buyer in results]


def _to_out(txn: Transaction, buyer: User) -> TransactionOut:
    return TransactionOut(
        transaction_id=txn.transaction_id,
        listing_id=txn.listing_id,
        seller_id=txn.seller_id,
        buyer_id=txn.buyer_id,
        buyer_name=buyer.full_name if buyer else None,
        agreed_price=txn.agreed_price,
        status=txn.status.value,
        created_at=txn.created_at,
        completed_at=txn.completed_at,
    )
