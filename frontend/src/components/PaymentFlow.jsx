import React, { useState } from 'react';
import { markOfferPaid, confirmReceiptOffer } from '../utils/mockService';

// Handles the full payment flow between buyer and seller using mobile money (MTN / Airtel)
// Renders a different UI depending on the user's role (isSeller) and the current txStatus
export default function PaymentFlow({ offer, listing, isSeller, onUpdate }) {
  const [method, setMethod] = useState(offer.payMethod || '');       // selected mobile money provider
  const [number, setNumber] = useState(offer.payNumber || '');       // mobile number to receive payment
  const [saved, setSaved] = useState(!!(offer.payMethod && offer.payNumber)); // true if seller has already set payment details
  const [processing, setProcessing] = useState(false);               // prevents double-clicks during async actions

  // Fall back to 'awaiting_payment' if txStatus hasn't been set yet
  const txStatus = offer.txStatus || 'awaiting_payment';

  // ─── SELLER: Step 1 — choose a payment method and enter their mobile number ───
  if (isSeller && !saved) {
    return (
      <div className="gc" style={{ padding: 20, marginTop: 14 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Set Your Payment Details</h4>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Choose how you want to receive <strong>{(offer.amount || offer.counterAmount || 0).toLocaleString()} RWF</strong>
        </p>

        {/* MTN / Airtel toggle cards — border and background change to match the selected provider */}
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

        {/* Number input only appears once a provider is selected */}
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
                if (!number.trim()) return; // ignore empty submissions
                // Persist payment details directly onto the offer object and mark as saved
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

  // ─── SELLER: Step 2 — payment details saved, waiting for buyer to send money ───
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

  // ─── SELLER: Step 3 — buyer has marked payment as sent, seller must confirm receipt ───
  if (isSeller && txStatus === 'awaiting_confirmation') {
    return (
      <div className="gc" style={{ padding: 20, marginTop: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--green)' }}>
          Buyer has marked payment as sent!
        </div>
        <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 14 }}>
          Confirm you have received <strong>{(offer.amount || 0).toLocaleString()} RWF</strong> via {offer.payMethod === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}.
        </p>
        {/* Simulated async confirmation — 1s delay mimics a real API call */}
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

  // ─── BOTH ROLES: Transaction is fully complete ───
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

  // ─── BUYER: Seller's payment details are ready — show number and "mark as paid" button ───
  if (!isSeller && saved) {
    return (
      <div style={{
        // Card color matches the seller's chosen provider (yellow for MTN, red for Airtel)
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

        {/* Prominently displayed phone number for the buyer to send money to */}
        <div style={{
          background: 'var(--bg2)', borderRadius: 10, padding: '14px 20px',
          marginBottom: 12, fontSize: 20, fontWeight: 800, textAlign: 'center',
          letterSpacing: 2, border: '1px solid var(--border)',
        }}>
          {offer.payNumber}
        </div>

        {/* Listing ID used as payment reference so the seller can match the transaction */}
        <p style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 14 }}>
          Use Listing #{listing?.id || offer.listingId} as your payment reference.
        </p>

        {/* Once the buyer clicks "sent", swap the button for a waiting message */}
        {txStatus === 'awaiting_confirmation' ? (
          <div className="al-s" style={{ borderRadius: 10, padding: 12 }}>
            Payment marked as sent. Waiting for seller confirmation...
          </div>
        ) : (
          // Simulated async action — 1s delay mimics a real API call
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

  // ─── BUYER: Waiting for seller to set up their payment details first ───
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

  // Fallback — no matching state, render nothing
  return null;
}