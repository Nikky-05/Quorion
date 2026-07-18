import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiCheckCircle, FiSmartphone, FiCreditCard, FiCopy, FiArrowLeft, FiClock } from 'react-icons/fi'
import { COMPANY } from '../data/company'
import './Register.css'
import './Payment.css'

const buildUpiUrl = ({ upiId, name, amount, note, tr }) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: name,
    am: String(amount),
    cu: 'INR',
    tn: note,
    tr,
  })
  return `upi://pay?${params.toString()}`
}

export default function Payment() {
  const navigate = useNavigate()
  const [app] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('subi_application')) || null
    } catch {
      return null
    }
  })
  const [method, setMethod] = useState('upi')
  const [txn, setTxn] = useState('')
  const [processing, setProcessing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!app) navigate('/register')
  }, [app, navigate])

  const trId = app?.applicationId || 'SUBI-' + Date.now().toString().slice(-8)
  const amount = COMPANY.registrationFee

  const upiUrl = useMemo(
    () =>
      buildUpiUrl({
        upiId: COMPANY.upiId,
        name: COMPANY.payeeName,
        amount,
        note: `SUBI Registration ${trId}`,
        tr: trId,
      }),
    [trId, amount]
  )

  // Static PhonePe QR (SUMANT KUMAR) served from /public
  const qrSrc = '/sumantji-qr.jpeg'

  const copy = () => {
    navigator.clipboard.writeText(COMPANY.upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const confirm = () => {
    if (method === 'upi' && txn.trim().length < 6) {
      alert('Please enter the UTR / Transaction ID after payment.')
      return
    }
    setProcessing(true)
    // Simulated payment verification. Replace with backend/Razorpay webhook.
    setTimeout(() => {
      const receipt = {
        applicationId: trId,
        name: app.fullName,
        amount,
        method,
        txn: txn || 'GATEWAY-' + Date.now(),
        paidAt: new Date().toISOString(),
      }
      localStorage.setItem('subi_receipt', JSON.stringify(receipt))
      navigate('/success')
    }, 1400)
  }

  const razorpayStub = () => {
    // Real integration: load https://checkout.razorpay.com/v1/checkout.js then new Razorpay(...).open()
    // For prototype we mimic a successful callback after a short delay.
    setMethod('card')
    setProcessing(true)
    setTimeout(() => {
      const receipt = {
        applicationId: trId,
        name: app.fullName,
        amount,
        method: 'card',
        txn: 'RZP-' + Date.now(),
        paidAt: new Date().toISOString(),
      }
      localStorage.setItem('subi_receipt', JSON.stringify(receipt))
      navigate('/success')
    }, 1600)
  }

  if (!app) return null

  return (
    <section className="reg-wrap">
      <div className="container">
        <div className="reg-head">
          <span className="badge">Payment</span>
          <h1>Complete your <span>registration payment</span></h1>
          <p>Pay <strong>₹{amount}</strong> to confirm application <strong>#{trId}</strong></p>
        </div>

        <div className="pay-grid">
          <div className="card pay-card">
            <div className="pay-tabs">
              <button
                className={`ptab ${method === 'upi' ? 'active' : ''}`}
                onClick={() => setMethod('upi')}
              >
                <FiSmartphone /> UPI / QR
              </button>
              <button
                className={`ptab ${method === 'card' ? 'active' : ''}`}
                onClick={() => setMethod('card')}
              >
                <FiCreditCard /> Card / Netbanking
              </button>
            </div>

            {method === 'upi' && (
              <div className="upi-body">
                <div className="qr-box">
                  <img src={qrSrc} alt="PhonePe QR — SUMANT KUMAR" style={{ maxWidth: '100%', height: 'auto' }} />
                  <div className="qr-caption">Scan with PhonePe / any UPI app</div>
                  <div className="upi-apps">
                    <span>PhonePe</span><span>GPay</span><span>Paytm</span><span>BHIM</span>
                  </div>
                </div>

                <div className="upi-details">
                  <div className="upi-row">
                    <div>
                      <span>Pay to</span>
                      <strong>{COMPANY.payeeName}</strong>
                    </div>
                  </div>
                  <div className="upi-row">
                    <div>
                      <span>UPI ID</span>
                      <strong>{COMPANY.upiId}</strong>
                    </div>
                    <button className="btn btn-outline copy-btn" onClick={copy}>
                      <FiCopy /> {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="upi-row">
                    <div>
                      <span>Amount</span>
                      <strong className="amt">₹{amount}</strong>
                    </div>
                  </div>
                  <div className="upi-row">
                    <div>
                      <span>Reference</span>
                      <strong>{trId}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: 22 }}>
                    <label>Enter UTR / Transaction ID after paying</label>
                    <input
                      value={txn}
                      onChange={(e) => setTxn(e.target.value)}
                      placeholder="12-digit UTR from your UPI app"
                      maxLength={20}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={confirm}
                    disabled={processing}
                    style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                  >
                    {processing ? <><FiClock /> Verifying...</> : <><FiCheckCircle /> I have paid — Confirm</>}
                  </button>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="card-body">
                <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
                  Pay securely using Card, Netbanking, Wallet or UPI via our payment gateway.
                </p>
                <div className="gw-brands">
                  <span>Visa</span>
                  <span>Mastercard</span>
                  <span>RuPay</span>
                  <span>UPI</span>
                  <span>Netbanking</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={razorpayStub}
                  disabled={processing}
                  style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
                >
                  {processing ? <><FiClock /> Redirecting to gateway...</> : <><FiCreditCard /> Proceed to Pay ₹{amount}</>}
                </button>
                <div className="secure">🔒 Secured by 256-bit SSL · PCI-DSS compliant</div>
              </div>
            )}
          </div>

          <div className="card pay-summary">
            <h3>Order Summary</h3>
            <div className="ps-row">
              <span>Applicant</span>
              <strong>{app.fullName}</strong>
            </div>
            <div className="ps-row">
              <span>Phone</span>
              <strong>{app.phone}</strong>
            </div>
            <div className="ps-row">
              <span>Role</span>
              <strong>{app.jobRole}</strong>
            </div>
            <div className="ps-row">
              <span>Application ID</span>
              <strong>{trId}</strong>
            </div>
            <div className="ps-divider" />
            <div className="ps-row">
              <span>Registration Fee</span>
              <strong>₹{amount}</strong>
            </div>
            <div className="ps-row">
              <span>Processing Fee</span>
              <strong>₹0</strong>
            </div>
            <div className="ps-total">
              <span>Total</span>
              <strong>₹{amount}</strong>
            </div>

            <div className="trust">
              <div>✅ Secure UPI</div>
              <div>✅ Instant Receipt</div>
              <div>✅ 100% Refundable if not verified</div>
            </div>

            <Link to="/register" className="btn btn-outline back-link">
              <FiArrowLeft /> Back to Registration
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
