import React, { useState } from 'react';
import { updateTransactionStatus } from '../utils/api';

async function markOfferPaid(offerId) {
  return updateTransactionStatus(offerId, 'in_transit');
}
async function confirmReceiptOffer(offerId) {
  return updateTransactionStatus(offerId, 'completed');
}

export default function PaymentFlow({ offer, listing, isSeller, onUpdate }) {
  const [method, setMethod] = useState(offer.payMethod || '');
  const [number, setNumber] = useState(offer.payNumber || '');
  const [saved, setSaved] = useState(!!(offer.payMethod && offer.payNumber));
  const [processing, setProcessing] = useState(false);

  const txStatus = offer.txStatus || 'awaiting_payment';

  // Seller: set payment details
  if (isSeller && !saved) {
    return (
      <div className="gc" style={{ padding: 20, marginTop: 14 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Set Your Payment Details</h4>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Choose how you want to receive <strong>{(offer.amount || offer.counterAmount || 0).toLocaleString()} RWF</strong>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {['mtn', 'airtel'].map(m => (
            <div key={m} onClick={() => setMethod(m)} style={{
              padding: 16, borderRadius: 12, cursor: 'pointer', textAlign: 'center',
              border: method === m ? `2px solid ${m === 'mtn' ? '#FFCC00' : '#ED1C24'}` : '1px solid var(--border)',
              background: method === m ? (m === 'mtn' ? '#FFFDE7' : '#FFF5F5') : 'var(--bg2)',
              transition: '.2s',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: m === 'mtn' ? '#FFCC00' : '#ED1C24' }}>
                {m === 'mtn' ? 'MTN' : 'Airtel'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{m === 'mtn' ? 'MoMo' : 'Money'}</div>
            </div>
          ))}
        </div>
        {method && (
          <>
            <div className="fg">
              <label className="fl">{method === 'mtn' ? 'MTN MoMo Number' : 'Airtel Money Number'}</label>
              <input
                className="fi"
                value={number}
                onChange={e => setNumber(e.target.value)}
                placeholder={method === 'mtn' ? '078XXXXXXX' : '073XXXXXXX'}
              />
            </div>
            <button
              className="btn-p"
              style={{ width: '100%', marginTop: 4 }}
              onClick={() => {
                if (!number.trim()) return;
                offer.payMethod = method;
                offer.payNumber = number;
                offer.paymentSet = true;
                setSaved(true);
                onUpdate && onUpdate();
              }}
            >
              Confirm Payment Details
            </button>
          </>
        )}
      </div>
    );
  }

  // Seller: awaiting payment
  if (isSeller && saved && txStatus === 'awaiting_payment') {
    return (
      <div className="al-i" style={{ padding: 16, marginTop: 14, borderRadius: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          Payment Info Set
        </div>
        <p style={{ fontSize: 12 }}>
          {method === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}: <strong>{number}</strong>
        </p>
        <p style={{ fontSize: 12, marginTop: 6, color: 'var(--text2)' }}>
          Waiting for buyer to send <strong>{(offer.amount || 0).toLocaleString()} RWF</strong>...
        </p>
      </div>
    );
  }

  // Seller: confirm receipt
  if (isSeller && txStatus === 'awaiting_confirmation') {
    return (
      <div className="gc" style={{ padding: 20, marginTop: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--green)' }}>
          Buyer has marked payment as sent!
        </div>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Confirm you have received <strong>{(offer.amount || 0).toLocaleString()} RWF</strong> via {offer.payMethod === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}.
        </p>
        <button
          className="btn-acc"
          style={{ width: '100%' }}
          disabled={processing}
          onClick={() => {
            setProcessing(true);
            setTimeout(() => {
              confirmReceiptOffer(offer.id);
              setProcessing(false);
              onUpdate && onUpdate();
            }, 1000);
          }}
        >
          {processing ? 'Processing...' : 'Confirm Receipt - Transaction Complete'}
        </button>
      </div>
    );
  }

  // Completed
  if (txStatus === 'completed') {
    return (
      <div className="al-s" style={{ padding: 16, marginTop: 14, borderRadius: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>Transaction Complete</div>
        <p style={{ fontSize: 12, marginTop: 4 }}>
          {(offer.amount || 0).toLocaleString()} RWF - {offer.payMethod === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}
        </p>
      </div>
    );
  }

  // Buyer: see seller payment details & mark paid
  if (!isSeller && saved) {
    return (
      <div style={{
        background: offer.payMethod === 'mtn' ? '#FFFDE7' : '#FFF5F5',
        border: `1px solid ${offer.payMethod === 'mtn' ? '#FFCC00' : '#ED1C24'}`,
        borderRadius: 16, padding: 20, marginTop: 14,
      }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
          Pay via {offer.payMethod === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}
        </h4>
        <p style={{ fontSize: 12, marginBottom: 10 }}>
          Send <strong style={{ fontSize: 17 }}>{(offer.amount || 0).toLocaleString()} RWF</strong> to:
        </p>
        <div style={{
          background: 'var(--bg2)', borderRadius: 10, padding: '14px 20px',
          marginBottom: 12, fontSize: 20, fontWeight: 800, textAlign: 'center',
          letterSpacing: 2, border: '1px solid var(--border)',
        }}>
          {offer.payNumber}
        </div>
        <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 14 }}>
          Use Listing #{listing?.id || offer.listingId} as your payment reference.
        </p>
        {txStatus === 'awaiting_confirmation' ? (
          <div className="al-s" style={{ borderRadius: 10, padding: 12 }}>
            Payment marked as sent. Waiting for seller confirmation...
          </div>
        ) : (
          <button
            className="btn-p"
            style={{ width: '100%' }}
            disabled={processing}
            onClick={() => {
              setProcessing(true);
              setTimeout(() => {
                markOfferPaid(offer.id);
                setProcessing(false);
                onUpdate && onUpdate();
              }, 1000);
            }}
          >
            {processing ? 'Processing...' : "I've Sent the Payment"}
          </button>
        )}
      </div>
    );
  }

  // Buyer: waiting for seller to set payment method
  if (!isSeller && !saved) {
    return (
      <div className="al-i" style={{ padding: 14, marginTop: 14, borderRadius: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>Offer Accepted!</div>
        <p style={{ fontSize: 12, marginTop: 4 }}>
          Waiting for the seller to set up their payment details. You'll be notified when ready.
        </p>
      </div>
    );
  }

  return null;
}
